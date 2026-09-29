const express = require("express");
const axios = require("axios");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");
const { validateMongoId, validatePayment } = require("../middleware/validation");
const { verifyPaystackWebhook, jsonParserWithRawBody } = require("../middleware/verifyWebhook");
const logger = require("../utils/logger");
const crypto = require("crypto");
const { confirmPayment } = require("../utils/confirmPayment");

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const GLOBAL_COMMISSION_RATE = 10;

if (!PAYSTACK_SECRET_KEY) {
  console.error("FATAL: PAYSTACK_SECRET_KEY environment variable is not set.");
}

const initializePayment = async (email, amount, metadata) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount,
        currency: "NGN",
        metadata,
        callback_url: `${process.env.CLIENT_BASE_URL || "https://iodlearn.vercel.app"}/payment/callback`
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Paystack initialization error:", error.response?.data || error.message);
    throw error;
  }
};

const verifyTransaction = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Paystack verification error:", error.response?.data || error.message);
    throw error;
  }
};

router.post("/initialize", verifyToken, validatePayment, async (req, res) => {
  const session = await Payment.startSession();
  
  try {
    session.startTransaction();
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId).populate("mentor").session(session);
    if (!course) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(404).json({ message: "User not found" });
    }

    if (user.enrolledCourses.includes(courseId)) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    if (!course.isPaid || course.price <= 0) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(400).json({ message: "This course is free" });
    }

    const idempotencyKey = `pay_${userId}_${courseId}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const existingPending = await Payment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "pending",
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
    }).session(session);
    
    if (existingPending) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      logger.warn("Duplicate payment attempt", { userId, courseId, existingRef: existingPending.transactionRef });
      return res.status(409).json({ 
        message: "Payment already in progress",
        transactionRef: existingPending.transactionRef
      });
    }

    // Convert price to kobo (integer minor units) to avoid floating-point issues
    const amountInKobo = Math.round(course.price * 100);
    
    let commissionRate, commissionAmountKobo, tutorEarningsKobo, platformEarningsKobo;

    if (course.uploaded_by === "admin") {
      // Admin uploaded course - 100% platform revenue, no mentor payout
      commissionRate = 0;
      commissionAmountKobo = 0;
      tutorEarningsKobo = 0;
      platformEarningsKobo = amountInKobo;
    } else {
      // Mentor uploaded course - apply commission split
      // Capture commission rate at time of payment to handle mid-transaction changes
      commissionRate = course.mentor.mentorProfile?.commissionRate || course.commissionPercent || GLOBAL_COMMISSION_RATE;
      // Calculate in kobo to avoid floating-point issues
      commissionAmountKobo = Math.round((amountInKobo * commissionRate) / 100);
      tutorEarningsKobo = amountInKobo - commissionAmountKobo;
      platformEarningsKobo = commissionAmountKobo;
    }

    const transactionRef = `TXN_${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    const payment = new Payment({
      user: userId,
      course: courseId,
      mentor: course.mentor._id,
      uploaded_by: course.uploaded_by,
      amount: amountInKobo, // Store in kobo (integer) ONLY
      transactionRef,
      idempotencyKey,
      commissionRate,
      commissionAmount: commissionAmountKobo, // Store in kobo ONLY
      tutorEarnings: tutorEarningsKobo, // Store in kobo ONLY
      platformEarnings: platformEarningsKobo, // Store in kobo ONLY
      paymentStatus: "pending",
      metadata: {
        courseTitle: course.title,
        mentorName: course.mentor.name,
        commissionRate // Store commission rate at time of payment
      }
    });
    await payment.save({ session });
    
    await session.commitTransaction();
    
    logger.payment("Payment initialized", {
      transactionRef,
      userId,
      courseId,
      amount: amountInKobo, // Log in kobo
      commissionRate,
      tutorEarnings: tutorEarningsKobo
    });

    const metadata = {
      transactionRef,
      idempotencyKey,
      userId,
      courseId,
      courseTitle: course.title,
      commissionRate,
      commissionAmount: commissionAmountKobo,
      tutorEarnings: tutorEarningsKobo
    };

    const paystackResponse = await initializePayment(user.email, amountInKobo, metadata);

    payment.paystackRef = paystackResponse.data.reference;
    await payment.save();

    res.json({
      authorizationUrl: paystackResponse.data.authorization_url,
      transactionRef,
      amount: amountInKobo / 100, // Return display value in naira (computed from kobo)
      commissionRate,
      tutorEarnings: tutorEarningsKobo / 100, // Return display value (computed from kobo)
      platformEarnings: platformEarningsKobo / 100 // Return display value (computed from kobo)
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    // Handle duplicate idempotencyKey error (race condition)
    if (err.code === 11000 && err.keyPattern?.idempotencyKey) {
      logger.warn("Duplicate idempotencyKey detected", { error: err.message });
      return res.status(409).json({ 
        message: "Payment already in progress - please try again",
        error: "duplicate_request"
      });
    }
    
    logger.error("Payment initialization failed", { error: err.message, stack: err.stack });
    res.status(500).json({ message: "Failed to initialize payment" });
  } finally {
    session.endSession();
  }
});

router.post("/verify-callback", verifyPaystackWebhook, async (req, res) => {
  const { event, data } = req.body;
  
  if (event !== "charge.success") {
    return res.status(200).json({ message: "Event ignored" });
  }
  
  const reference = data.reference;
  const metadata = data.metadata || {};
  const { transactionRef, idempotencyKey, userId, courseId } = metadata;
  
  const session = await Payment.startSession();
  
  try {
    session.startTransaction();
    
    const payment = await Payment.findOne({ 
      $or: [
        { transactionRef },
        { paystackRef: reference }
      ]
    }).session(session);
    
    if (!payment) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      logger.error("Payment not found for webhook", { transactionRef, reference });
      return res.status(404).json({ message: "Payment not found" });
    }
    
    if (payment.paymentStatus === "success") {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      logger.warn("Duplicate payment webhook", { transactionRef, reference });
      return res.status(200).json({ message: "Already processed" });
    }
    
if (payment.paymentStatus === "failed") {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      logger.warn("Payment already failed", { transactionRef, reference });
      return res.status(200).json({ message: "Already processed" });
    }

    // Shared confirmation logic: marks success, enrolls the student, and
    // credits the correct wallet based on uploaded_by. Same function used by
    // POST /verify so both paths can never drift apart.
    await confirmPayment(payment, data, session);

    await session.commitTransaction();
    
    logger.payment("Webhook payment verified and credited", {
      transactionRef: payment.transactionRef,
      tutorEarnings: payment.tutorEarnings,
      mentorId: payment.mentor
    });
    
    res.status(200).json({ message: "Payment verified" });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    logger.error("Webhook processing failed", { error: err.message, reference });
    res.status(500).json({ message: "Processing failed" });
  } finally {
    session.endSession();
  }
});

router.post("/verify", verifyToken, async (req, res) => {
  const session = await Payment.startSession();
  
  try {
    session.startTransaction();
    const { reference, transactionRef } = req.body;
    const userId = req.user.id;

    if (!reference && !transactionRef) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(400).json({ message: "Reference or transactionRef required" });
    }

    const query = transactionRef
      ? { transactionRef, user: userId }
      : { paystackRef: reference, user: userId };

    const payment = await Payment.findOne(query).session(session);
    if (!payment) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.paymentStatus === "success") {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      const course = await Course.findById(payment.course);
      return res.json({ 
        message: "Payment already verified", 
        payment,
        course: { id: course?._id, title: course?.title }
      });
    }

    if (payment.paymentStatus === "failed") {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      return res.status(400).json({ message: "Payment failed" });
    }

    const verification = await verifyTransaction(reference || payment.paystackRef);

// Paystack's verify endpoint returns an envelope shaped like:
//   { status: true, data: { status: "success", ... } }
// verifyTransaction() returns response.data — i.e. the envelope itself — so the
// authoritative payment outcome is verification.data.status (a string:
// "success" | "abandoned" | "failed"). The original code compared
// verification.data.status === "success" which was correct; a later change to
// verification.data?.data?.status was wrong (that path is always undefined)
// and made every successful /verify call misclassify the payment as failed.
const isSuccessful = verification.data?.status === "success";

    if (isSuccessful) {
      // Shared confirmation logic — same function used by /verify-callback so
      // both paths branch on uploaded_by identically and write inside the
      // transaction (session passed straight to addEarning, not { session }).
      await confirmPayment(payment, verification.data, session);

      logger.payment("Callback payment verified", {
        transactionRef: payment.transactionRef,
        userId,
        courseId: payment.course
      });

      if (session.inTransaction()) {
        await session.commitTransaction();
      }

      const course = await Course.findById(payment.course);
      res.json({
        message: "Payment successful",
        payment,
        course: { id: course?._id, title: course?.title }
      });
    } else {
      payment.paymentStatus = "failed";
      payment.gatewayResponse = verification.data;
      await payment.save();

      if (session.inTransaction()) {
        await session.commitTransaction();
      }
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    logger.error("Payment verification failed", { error: err.message });
    res.status(500).json({ message: "Failed to verify payment" });
  } finally {
    session.endSession();
  }
});

router.get("/history", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ user: userId })
      .populate("course", "title thumbnail price")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payment history" });
  }
});

router.get("/course/:courseId", verifyToken, validateMongoId, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const payment = await Payment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "success"
    });

    if (!payment) {
      return res.status(404).json({ message: "No payment found for this course" });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: "Failed to check payment" });
  }
});

router.get("/mentor-earnings", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.role !== "mentor" || !user.isMentorApproved) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.json({
        pendingBalance: 0,
        availableBalance: 0,
        totalEarnings: 0,
        totalWithdrawn: 0,
        transactions: []
      });
    }

    // Release pending earnings into availableBalance before reporting so the
    // dashboard and the withdrawal form always agree. Idempotent: if nothing
    // is pending the balances are unchanged.
    if (wallet.pendingBalance > 0) {
      wallet.availableBalance += wallet.pendingBalance;
      wallet.pendingBalance = 0;
      await wallet.save();
    }

    res.json({
      pendingBalance: wallet.pendingBalance,
      availableBalance: wallet.availableBalance,
      totalEarnings: wallet.totalEarnings,
      totalWithdrawn: wallet.totalWithdrawn,
      transactions: wallet.transactions.slice(-20)
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch earnings" });
  }
});

router.post("/withdraw", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bankName, accountNumber, accountName } = req.body;

    const user = await User.findById(userId);
    if (user.role !== "mentor" || !user.isMentorApproved) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(400).json({ message: "No wallet found" });
    }

    // Earnings land in pendingBalance; only released earnings are withdrawable.
    // Without this release step every mentor would be permanently blocked
    // with a zero availableBalance regardless of how much they earned.
    if (wallet.pendingBalance > 0) {
      wallet.availableBalance += wallet.pendingBalance;
      wallet.pendingBalance = 0;
    }

    if (wallet.availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (amount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal is ₦500" });
    }

    wallet.availableBalance -= amount;
    wallet.withdrawals.push({
      user: userId,
      amount,
      status: "pending",
      bankDetails: { bankName, accountNumber, accountName }
    });
    wallet.transactions.push({
      type: "withdrawal",
      amount: -amount,
      description: "Withdrawal requested",
      status: "pending"
    });
    await wallet.save();

    logger.info("Withdrawal requested", { userId, amount });

    res.json({ message: "Withdrawal request submitted", amount });
  } catch (err) {
    res.status(500).json({ message: "Failed to request withdrawal" });
  }
});

router.post("/withdraw/:withdrawalId/approve", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const adminId = req.user.id;

    const wallet = await Wallet.findOne({ "withdrawals._id": withdrawalId });
    if (!wallet) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    await wallet.approveWithdrawal(withdrawalId, adminId);

    logger.admin("Withdrawal approved", { withdrawalId, adminId });

    res.json({ message: "Withdrawal approved" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to approve withdrawal" });
  }
});

router.post("/withdraw/:withdrawalId/reject", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user.id;

    const wallet = await Wallet.findOne({ "withdrawals._id": withdrawalId });
    if (!wallet) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    await wallet.rejectWithdrawal(withdrawalId, adminId, adminNotes);

    logger.admin("Withdrawal rejected", { withdrawalId, adminId, adminNotes });

    res.json({ message: "Withdrawal rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to reject withdrawal" });
  }
});

// Refund endpoint (admin only)
router.post("/:paymentId/refund", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { refundAmount, refundReason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "success") {
      return res.status(400).json({ message: "Can only refund successful payments" });
    }

    if (payment.isRefunded) {
      return res.status(400).json({ message: "Payment already refunded" });
    }

    // Convert naira to kobo if provided, otherwise use full amount in kobo
    const amountToRefundKobo = refundAmount ? Math.round(refundAmount * 100) : payment.amount;

    if (amountToRefundKobo > payment.amount) {
      return res.status(400).json({ message: "Refund amount cannot exceed payment amount" });
    }

    await payment.processRefund(amountToRefundKobo, refundReason || "Admin refund", req.user.id);

    logger.admin("Payment refunded", { 
      paymentId, 
      transactionRef: payment.transactionRef, 
      refundAmount: amountToRefundKobo, // Log in kobo
      adminId: req.user.id 
    });

    res.json({ 
      message: "Refund processed successfully", 
      payment
    });
  } catch (err) {
    logger.error("Refund processing failed", { error: err.message });
    res.status(500).json({ message: "Failed to process refund" });
  }
});

module.exports = router;