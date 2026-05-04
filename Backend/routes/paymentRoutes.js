const express = require("express");
const axios = require("axios");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { verifyToken, verifyAdmin } = require("../middleware/verifyToken");
const { validateMongoId, validatePayment } = require("../middleware/validation");
const logger = require("../utils/logger");
const crypto = require("crypto");

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
        callback_url: `${process.env.CLIENT_BASE_URL || "http://localhost:5173"}/payment/callback`
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
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const course = await Course.findById(courseId).populate("mentor");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    if (!course.isPaid || course.price <= 0) {
      return res.status(400).json({ message: "This course is free" });
    }

    const idempotencyKey = `pay_${userId}_${courseId}_${Date.now()}`;
    const existingPending = await Payment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "pending",
      createdAt: { $gt: new Date(Date.now() - 30 * 60 * 1000) }
    });
    
    if (existingPending) {
      logger.warn("Duplicate payment attempt", { userId, courseId, existingRef: existingPending.transactionRef });
      return res.status(409).json({ 
        message: "Payment already in progress",
        transactionRef: existingPending.transactionRef
      });
    }

    const amountInKobo = course.price * 100;
    const amountInNaira = course.price;
    
    const commissionRate = course.mentor.mentorProfile?.commissionRate || course.commissionPercent || GLOBAL_COMMISSION_RATE;
    const commissionAmount = Number(((amountInNaira * commissionRate) / 100).toFixed(2));
    const tutorEarnings = Number((amountInNaira - commissionAmount).toFixed(2));
    const platformEarnings = commissionAmount;

    const transactionRef = `TXN_${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

    const payment = new Payment({
      user: userId,
      course: courseId,
      mentor: course.mentor._id,
      amount: amountInNaira,
      transactionRef,
      idempotencyKey,
      commissionRate,
      commissionAmount,
      tutorEarnings,
      platformEarnings,
      paymentStatus: "pending",
      metadata: {
        courseTitle: course.title,
        mentorName: course.mentor.name
      }
    });
    await payment.save();
    
    logger.payment("Payment initialized", {
      transactionRef,
      userId,
      courseId,
      amount: amountInNaira,
      commissionRate,
      tutorEarnings
    });

    const metadata = {
      transactionRef,
      idempotencyKey,
      userId,
      courseId,
      courseTitle: course.title,
      commissionRate,
      commissionAmount,
      tutorEarnings
    };

    const paystackResponse = await initializePayment(user.email, amountInKobo, metadata);

    payment.paystackRef = paystackResponse.data.reference;
    await payment.save();

    res.json({
      authorizationUrl: paystackResponse.data.authorization_url,
      transactionRef,
      amount: amountInNaira,
      commissionRate,
      tutorEarnings,
      platformEarnings
    });
  } catch (err) {
    logger.error("Payment initialization failed", { error: err.message, stack: err.stack });
    res.status(500).json({ message: "Failed to initialize payment" });
  }
});

router.post("/verify-callback", async (req, res) => {
  const { event, data } = req.body;
  
  if (event !== "charge.success") {
    return res.status(200).json({ message: "Event ignored" });
  }
  
  const reference = data.reference;
  const metadata = data.metadata || {};
  const { transactionRef, idempotencyKey, userId, courseId } = metadata;
  
  try {
    const payment = await Payment.findOne({ 
      $or: [
        { transactionRef },
        { paystackRef: reference }
      ]
    });
    
    if (!payment) {
      logger.error("Payment not found for webhook", { transactionRef, reference });
      return res.status(404).json({ message: "Payment not found" });
    }
    
    if (payment.paymentStatus === "success") {
      logger.warn("Duplicate payment webhook", { transactionRef, reference });
      return res.status(200).json({ message: "Already processed" });
    }
    
    if (payment.paymentStatus === "failed") {
      logger.warn("Payment already failed", { transactionRef, reference });
      return res.status(200).json({ message: "Already processed" });
    }
    
    payment.paymentStatus = "success";
    payment.paystackRef = reference;
    payment.channel = data.channel;
    payment.paymentMethod = data.payment_method?.type;
    payment.gatewayResponse = data;
    payment.paymentVerifiedAt = new Date();
    await payment.save();
    
    await User.findByIdAndUpdate(payment.user, {
      $addToSet: { 
        enrolledCourses: payment.course, 
        purchasedCourses: payment.course 
      }
    });
    
    await Course.findByIdAndUpdate(payment.course, {
      $addToSet: { enrolledStudents: payment.user }
    });
    
    let wallet = await Wallet.findOne({ user: payment.mentor });
    if (!wallet) {
      wallet = new Wallet({ user: payment.mentor });
      await wallet.save();
    }
    
    await wallet.addEarning(
      payment.tutorEarnings,
      `Course sale: ${payment.transactionRef}`,
      payment._id
    );
    
    logger.payment("Webhook payment verified and credited", {
      transactionRef: payment.transactionRef,
      tutorEarnings: payment.tutorEarnings,
      mentorId: payment.mentor
    });
    
    res.status(200).json({ message: "Payment verified" });
  } catch (err) {
    logger.error("Webhook processing failed", { error: err.message, reference });
    res.status(500).json({ message: "Processing failed" });
  }
});

router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { reference, transactionRef } = req.body;
    const userId = req.user.id;

    if (!reference && !transactionRef) {
      return res.status(400).json({ message: "Reference or transactionRef required" });
    }

    const query = transactionRef
      ? { transactionRef, user: userId }
      : { paystackRef: reference, user: userId };

    const payment = await Payment.findOne(query);
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.paymentStatus === "success") {
      const course = await Course.findById(payment.course);
      return res.json({ 
        message: "Payment already verified", 
        payment,
        course: { id: course?._id, title: course?.title }
      });
    }

    if (payment.paymentStatus === "failed") {
      return res.status(400).json({ message: "Payment failed" });
    }

    const verification = await verifyTransaction(reference || payment.paystackRef);

    if (verification.data.status === "success") {
      await payment.verifyAndCredit(verification.data);
      
      logger.payment("Callback payment verified", {
        transactionRef: payment.transactionRef,
        userId,
        courseId: payment.course
      });

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
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (err) {
    logger.error("Payment verification failed", { error: err.message });
    res.status(500).json({ message: "Failed to verify payment" });
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
    if (!wallet || wallet.availableBalance < amount) {
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

module.exports = router;