const mongoose = require("mongoose");

/**
 * confirmPayment — shared by BOTH /verify and /verify-callback.
 *
 * Marks a pending payment as successful, enrolls the student, and credits the
 * correct wallet based on uploaded_by:
 *   - admin course  -> admin wallet gets platformEarnings
 *   - mentor course -> mentor wallet gets tutorEarnings
 *
 * The session is passed straight through to addEarning (the session itself,
 * not { session }) so every write lives inside the same transaction.
 *
 * @param {Payment} payment        - the Payment document (must be pending)
 * @param {Object}  gatewayData    - raw gateway (Paystack) response
 * @param {ClientSession} session  - mongoose ClientSession to write within
 */
const confirmPayment = async (payment, gatewayData, session) => {
  if (payment.paymentStatus !== "pending") {
    throw new Error("Payment already processed");
  }

  payment.paymentStatus = "success";
  payment.paymentVerifiedAt = new Date();
  payment.gatewayResponse = gatewayData;
  if (gatewayData && gatewayData.channel) {
    payment.channel = gatewayData.channel;
  }
  if (gatewayData && gatewayData.payment_method) {
    payment.paymentMethod = gatewayData.payment_method?.type || gatewayData.payment_method;
  }
  await payment.save({ session });

  const User = mongoose.model("User");
  const Course = mongoose.model("Course");
  const Wallet = mongoose.model("Wallet");

  // Enroll the student (idempotent thanks to $addToSet)
  await User.findByIdAndUpdate(
    payment.user,
    { $addToSet: { enrolledCourses: payment.course, purchasedCourses: payment.course } },
    { session, new: true }
  );

  await Course.findByIdAndUpdate(
    payment.course,
    { $addToSet: { enrolledStudents: payment.user } },
    { session, new: true }
  );

  // Credit the correct wallet based on uploaded_by
  if (payment.uploaded_by === "admin") {
    let wallet = await Wallet.findOne({ user: payment.mentor }).session(session);
    if (!wallet) {
      wallet = new Wallet({ user: payment.mentor });
      await wallet.save({ session });
    }
    // Admin courses route platformEarnings to the admin's wallet
    await wallet.addEarning(
      payment.platformEarnings,
      `Admin course sale: ${payment.transactionRef}`,
      payment._id,
      session
    );
  } else {
    // Mentor courses route tutorEarnings to the mentor's wallet
    let wallet = await Wallet.findOne({ user: payment.mentor }).session(session);
    if (!wallet) {
      wallet = new Wallet({ user: payment.mentor });
      await wallet.save({ session });
    }
    await wallet.addEarning(
      payment.tutorEarnings,
      `Course sale: ${payment.transactionRef}`,
      payment._id,
      session
    );
  }

  return payment;
};

module.exports = { confirmPayment };