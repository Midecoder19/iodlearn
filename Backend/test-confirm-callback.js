const axios = require("axios");
const mongoose = require("mongoose");
const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const BASE = "http://localhost:9000/api";

// Compute a valid Paystack webhook signature (HMAC-SHA512 of the raw body)
const signWebhook = (body) => {
  const raw = JSON.stringify(body);
  return crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(raw).digest("hex");
};

(async () => {
  console.log("test-confirm-callback: starting");
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  const db = conn.connection.db;
  const users = db.collection("users");
  const payments = db.collection("payments");
  const courses = db.collection("courses");
  const wallets = db.collection("wallets");
  const pw = "Password123!";
  const results = [];
  function check(name, ok, detail) {
    results.push({ name, ok, detail });
    console.log((ok ? "PASS" : "FAIL") + " - " + name + (detail ? " | " + detail : ""));
  }

  const admin = await axios.post(BASE + "/auth/login", { email: "testadmin@example.com", password: "AdminPass123!" });
  const atoken = admin.data.token;
  const adminUser = await users.findOne({ email: "testadmin@example.com" });
  await wallets.updateOne({ user: adminUser._id }, { $set: { pendingBalance: 0, availableBalance: 0, totalEarnings: 0 } });

  const se = "cbstudent" + Math.floor(Math.random() * 90000 + 10000) + "@example.com";
  await axios.post(BASE + "/auth/register", { name: "Callback Student", email: se, password: pw, passwordConfirmation: pw, role: "student" });
  const su = await users.findOne({ email: se });
  const sv = await axios.post(BASE + "/auth/verify-otp", { email: se, otp: su.otp });
  const stoken = sv.data.token;

  const me = "cbmentor" + Math.floor(Math.random() * 90000 + 10000) + "@example.com";
  await axios.post(BASE + "/auth/register", { name: "Callback Mentor", email: me, password: pw, passwordConfirmation: pw, role: "mentor" });
  const mu = await users.findOne({ email: me });
  await axios.post(BASE + "/auth/verify-otp", { email: me, otp: mu.otp });
  await users.updateOne({ _id: mu._id }, { $set: { isMentorApproved: true, role: "mentor" } });
  const ml = await axios.post(BASE + "/auth/login", { email: me, password: pw });
  const mtoken = ml.data.token;

  // admin course via webhook
  const acr = await axios.post(BASE + "/courses", { title: "Admin Webhook Course", description: "d", category: "programming", level: "beginner", price: 2000, isPaid: true }, { headers: { Authorization: "Bearer " + atoken } });
  const ainit = await axios.post(BASE + "/payments/initialize", { courseId: acr.data.course._id }, { headers: { Authorization: "Bearer " + stoken } });
  const apay = await payments.findOne({ transactionRef: ainit.data.transactionRef });
  const webhookBody = {
    event: "charge.success",
    data: {
      reference: apay.paystackRef,
      channel: "card",
      payment_method: { type: "card" },
      metadata: { transactionRef: apay.transactionRef, courseId: acr.data.course._id, userId: su._id.toString() },
      amount: apay.amount, currency: "NGN"
    }
  };
  const awalletBefore = await wallets.findOne({ user: new mongoose.Types.ObjectId(acr.data.course.mentor) });
  console.log("  admin wallet BEFORE /verify-callback:", awalletBefore ? awalletBefore.pendingBalance : "no wallet", "kobo");

  const cbAdmin = await axios.post(BASE + "/payments/verify-callback", webhookBody, {
    headers: { "x-paystack-signature": signWebhook(webhookBody) }
  });
  const apayAfter = await payments.findOne({ _id: apay._id });
  const awallet = await wallets.findOne({ user: new mongoose.Types.ObjectId(acr.data.course.mentor) });
  console.log("  admin wallet AFTER /verify-callback:", awallet ? awallet.pendingBalance : "no wallet", "kobo");
  console.log("  admin webhook status:", cbAdmin.status, "| paymentStatus:", apayAfter.paymentStatus);
  check("admin course /verify-callback success + wallet credit",
    cbAdmin.status === 200 && apayAfter.paymentStatus === "success" && awallet && awallet.pendingBalance === apay.platformEarnings,
    "wallet:" + (awallet ? awallet.pendingBalance : "null") + " expected:" + apay.platformEarnings);

  // mentor course via webhook
  const mcr = await axios.post(BASE + "/courses", { title: "Mentor Webhook Course", description: "d", category: "programming", level: "beginner", price: 3000, isPaid: true }, { headers: { Authorization: "Bearer " + mtoken } });
  const minit = await axios.post(BASE + "/payments/initialize", { courseId: mcr.data.course._id }, { headers: { Authorization: "Bearer " + stoken } });
  const mpay = await payments.findOne({ transactionRef: minit.data.transactionRef });
  const webhookBody2 = {
    event: "charge.success",
    data: {
      reference: mpay.paystackRef,
      channel: "card",
      payment_method: { type: "card" },
      metadata: { transactionRef: mpay.transactionRef, courseId: mcr.data.course._id, userId: su._id.toString() },
      amount: mpay.amount, currency: "NGN"
    }
  };
  const mwalletBefore = await wallets.findOne({ user: mu._id });
  console.log("  mentor wallet BEFORE /verify-callback:", mwalletBefore ? mwalletBefore.pendingBalance : "no wallet", "kobo");

  const cbMentor = await axios.post(BASE + "/payments/verify-callback", webhookBody2, {
    headers: { "x-paystack-signature": signWebhook(webhookBody2)  


        
     }
  });
  const mpayAfter = await payments.findOne({ _id: mpay._id });
  const mwallet = await wallets.findOne({ user: mu._id });
  console.log("  mentor wallet AFTER /verify-callback:", mwallet ? mwallet.pendingBalance : "no wallet", "kobo");
  console.log("  mentor webhook status:", cbMentor.status, "| paymentStatus:", mpayAfter.paymentStatus);
  check("mentor course /verify-callback success + wallet credit",
    cbMentor.status === 200 && mpayAfter.paymentStatus === "success" && mwallet && mwallet.pendingBalance === mpay.tutorEarnings,
    "wallet:" + (mwallet ? mwallet.pendingBalance : "null") + " expected:" + mpay.tutorEarnings);

  const allPass = results.every(r => r.ok);
  console.log("\n=== CONFIRM PAYMENT (/verify-callback): " + (allPass ? "ALL PASS" : "SOME FAIL") + " ===");
  await conn.disconnect();
  process.exit(allPass ? 0 : 1);
})();
