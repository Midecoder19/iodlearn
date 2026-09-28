const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });

(async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  const db = conn.connection.db;
  const wallets = db.collection("wallets");
  const users = db.collection("users");
  const payments = db.collection("payments");

  const allWallets = await wallets.find({}).toArray();
  console.log("Total wallets:", allWallets.length);
  allWallets.forEach(w => console.log("  wallet user:", w.user.toString().slice(-8), "| pendingBalance:", w.pendingBalance));

  const admins = await users.find({ role: "admin" }).toArray();
  admins.forEach(u => console.log("  admin user:", u._id.toString().slice(-8), "| email:", u.email));

  const recentPayments = await payments.find({ paymentStatus: "success" }).sort({ createdAt: -1 }).limit(3).toArray();
  recentPayments.forEach(p => console.log("  payment mentor:", p.mentor.toString().slice(-8), "| uploaded_by:", p.uploaded_by, "| platformEarnings:", p.platformEarnings));

  await conn.disconnect();
})();