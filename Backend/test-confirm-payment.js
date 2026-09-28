const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

const BASE = "http://localhost:9000/api";

(async () => {
  console.log("test-confirm-payment: starting");
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

  // admin login
  const admin = await axios.post(BASE + "/auth/login", { email: "testadmin@example.com", password: "AdminPass123!" });
  const atoken = admin.data.token;
  const adminUser = await users.findOne({ email: "testadmin@example.com" });

  // reset the admin's wallet so the balance reflects only this run
  await wallets.updateOne({ user: adminUser._id }, { $set: { pendingBalance: 0, availableBalance: 0, totalEarnings: 0 } });

  // student
  const se = "confstudent" + Math.floor(Math.random() * 90000 + 10000) + "@example.com";
  await axios.post(BASE + "/auth/register", { name: "Confirm Student", email: se, password: pw, passwordConfirmation: pw, role: "student" });
  const su = await users.findOne({ email: se });
  const sv = await axios.post(BASE + "/auth/verify-otp", { email: se, otp: su.otp });
  const stoken = sv.data.token;

  // mentor
  const me = "confmentor" + Math.floor(Math.random() * 90000 + 10000) + "@example.com";
  await axios.post(BASE + "/auth/register", { name: "Confirm Mentor", email: me, password: pw, passwordConfirmation: pw, role: "mentor" });
  const mu = await users.findOne({ email: me });
  const mv = await axios.post(BASE + "/auth/verify-otp", { email: me, otp: mu.otp });
  await users.updateOne({ _id: mu._id }, { $set: { isMentorApproved: true, role: "mentor" } });
  const ml = await axios.post(BASE + "/auth/login", { email: me, password: pw });
  const mtoken = ml.data.token;

  // ---- ADMIN COURSE ----
  const acr = await axios.post(BASE + "/courses", { title: "Admin Confirm Course", description: "d", category: "programming", level: "beginner", price: 4000, isPaid: true }, { headers: { Authorization: "Bearer " + atoken } });
  const adminCourseId = acr.data.course._id;
  const adminMentorId = acr.data.course.mentor;
  console.log("ADMIN COURSE uploaded_by:", acr.data.course.uploaded_by, "| mentor:", adminMentorId.toString().slice(-8));

  const ainit = await axios.post(BASE + "/payments/initialize", { courseId: adminCourseId }, { headers: { Authorization: "Bearer " + stoken } });
  const apay = await payments.findOne({ transactionRef: ainit.data.transactionRef });
  console.log("ADMIN PAYMENT amount:", apay.amount, "| tutorEarnings:", apay.tutorEarnings, "| platformEarnings:", apay.platformEarnings, "| uploaded_by:", apay.uploaded_by);

  // mock a SUCCESSFUL Paystack response via the shared file the server reads
  const fs = require("fs");
  const path = require("path");
  const setMock = (obj) => fs.writeFileSync(path.join(__dirname, "paystack-mock.json"), JSON.stringify(obj));

  setMock({
    status: true, message: "Verification successful",
    data: { id: 111, status: "success", reference: apay.paystackRef, amount: apay.amount, currency: "NGN", channel: "card", gateway_response: "Approved" }
  });

  const awalletBefore = await wallets.findOne({ user: new mongoose.Types.ObjectId(adminMentorId) });
  console.log("  admin wallet BEFORE /verify:", awalletBefore ? awalletBefore.pendingBalance : "no wallet", "kobo");

  const averify = await axios.post(BASE + "/payments/verify", { reference: apay.paystackRef }, { headers: { Authorization: "Bearer " + stoken } });
  console.log("ADMIN /verify status:", averify.status, averify.data.message);

  const apayAfter = await payments.findOne({ _id: apay._id });
  const awallet = await wallets.findOne({ user: new mongoose.Types.ObjectId(adminMentorId) });
  console.log("  admin wallet AFTER /verify:", awallet ? awallet.pendingBalance : "no wallet", "kobo");
  console.log("ADMIN paymentStatus:", apayAfter.paymentStatus);
  check("admin course /verify success + wallet credit",
    averify.status === 200 && apayAfter.paymentStatus === "success" && awallet && awallet.pendingBalance === apay.platformEarnings,
    "wallet:" + (awallet ? awallet.pendingBalance : "null") + " expected:" + apay.platformEarnings);

  // ---- MENTOR COURSE ----
  const mcr = await axios.post(BASE + "/courses", { title: "Mentor Confirm Course", description: "d", category: "programming", level: "beginner", price: 5000, isPaid: true }, { headers: { Authorization: "Bearer " + mtoken } });
  const mentorCourseId = mcr.data.course._id;
  console.log("MENTOR COURSE uploaded_by:", mcr.data.course.uploaded_by, "| mentor:", mu._id.toString().slice(-8));

  const minit = await axios.post(BASE + "/payments/initialize", { courseId: mentorCourseId }, { headers: { Authorization: "Bearer " + stoken } });
  const mpay = await payments.findOne({ transactionRef: minit.data.transactionRef });
  console.log("MENTOR PAYMENT amount:", mpay.amount, "| tutorEarnings:", mpay.tutorEarnings, "| platformEarnings:", mpay.platformEarnings, "| uploaded_by:", mpay.uploaded_by);

  setMock({
    status: true, message: "Verification successful",
    data: { id: 222, status: "success", reference: mpay.paystackRef, amount: mpay.amount, currency: "NGN", channel: "card", gateway_response: "Approved" }
  });

  const mwalletBefore = await wallets.findOne({ user: mu._id });
  console.log("  mentor wallet BEFORE /verify:", mwalletBefore ? mwalletBefore.pendingBalance : "no wallet", "kobo");

  const mverify = await axios.post(BASE + "/payments/verify", { reference: mpay.paystackRef }, { headers: { Authorization: "Bearer " + stoken } });
  console.log("MENTOR /verify status:", mverify.status, mverify.data.message);

  const mpayAfter = await payments.findOne({ _id: mpay._id });
  const mwallet = await wallets.findOne({ user: mu._id });
  console.log("  mentor wallet AFTER /verify:", mwallet ? mwallet.pendingBalance : "no wallet", "kobo");
  console.log("MENTOR paymentStatus:", mpayAfter.paymentStatus);
  check("mentor course /verify success + wallet credit",
    mverify.status === 200 && mpayAfter.paymentStatus === "success" && mwallet && mwallet.pendingBalance === mpay.tutorEarnings,
    "wallet:" + (mwallet ? mwallet.pendingBalance : "null") + " expected:" + mpay.tutorEarnings);

  const allPass = results.every(r => r.ok);
  console.log("\n=== CONFIRM PAYMENT (/verify): " + (allPass ? "ALL PASS" : "SOME FAIL") + " ===");
  await conn.disconnect();
  process.exit(allPass ? 0 : 1);
})();