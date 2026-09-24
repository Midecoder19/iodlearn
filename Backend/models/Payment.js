const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploaded_by: { type: String, enum: ["admin", "mentor"], required: true },
  amount: { type: Number, required: true }, // Stored in kobo (integer minor units) ONLY
  currency: { type: String, default: "NGN" },
  transactionRef: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, unique: true, sparse: true },
  paystackRef: { type: String },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "success", "failed", "refunded"], 
    default: "pending"
  },
  paymentMethod: { type: String },
  channel: { type: String },
  gatewayResponse: { type: Object },
  
  commissionRate: { type: Number, required: true },
  commissionAmount: { type: Number, default: 0 }, // Stored in kobo ONLY
  tutorEarnings: { type: Number, default: 0 }, // Stored in kobo ONLY
  platformEarnings: { type: Number, default: 0 }, // Stored in kobo ONLY
  
  isRefunded: { type: Boolean, default: false },
  refundedAt: { type: Date },
  refundAmount: { type: Number }, // Stored in kobo ONLY
  refundReason: { type: String },
  refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  metadata: { type: Object, default: {} },
  
  paymentInitiatedAt: { type: Date, default: Date.now },
  paymentVerifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual fields for naira display value (computed at read time)
paymentSchema.virtual('amountNaira').get(function() {
  return this.amount / 100;
});

paymentSchema.virtual('commissionAmountNaira').get(function() {
  return this.commissionAmount / 100;
});

paymentSchema.virtual('tutorEarningsNaira').get(function() {
  return this.tutorEarnings / 100;
});

paymentSchema.virtual('platformEarningsNaira').get(function() {
  return this.platformEarnings / 100;
});

paymentSchema.virtual('refundAmountNaira').get(function() {
  return this.refundAmount / 100;
});

paymentSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

paymentSchema.index({ paystackRef: 1 });
paymentSchema.index({ paymentStatus: 1, createdAt: -1 });

paymentSchema.methods.verifyAndCredit = async function(gatewayData) {
  if (this.paymentStatus !== "pending") {
    throw new Error("Payment already processed");
  }
  
  this.paymentStatus = "success";
  this.paymentVerifiedAt = new Date();
  this.gatewayResponse = gatewayData;
  
  if (gatewayData.channel) {
    this.channel = gatewayData.channel;
  }
  
  await this.save();
  
  const User = mongoose.model("User");
  const Course = mongoose.model("Course");
  const Wallet = mongoose.model("Wallet");
  
  await User.findByIdAndUpdate(this.user, {
    $addToSet: { 
      enrolledCourses: this.course, 
      purchasedCourses: this.course 
    }
  });
  
  await Course.findByIdAndUpdate(this.course, {
    $addToSet: { enrolledStudents: this.user }
  });
  
  let wallet = await Wallet.findOne({ user: this.mentor });
  if (!wallet) {
    wallet = new Wallet({ user: this.mentor });
    await wallet.save();
  }
  
  await wallet.addEarning(
    this.tutorEarnings,
    `Course payment: ${this.transactionRef}`,
    this._id
  );
  
  return this;
};

paymentSchema.methods.processRefund = async function(refundAmount, refundReason, adminId) {
  if (this.paymentStatus !== "success") {
    throw new Error("Can only refund successful payments");
  }
  
  if (this.isRefunded) {
    throw new Error("Payment already refunded");
  }
  
  if (refundAmount > this.amount) {
    throw new Error("Refund amount cannot exceed payment amount");
  }
  
  const session = await this.constructor.startSession();
  
  try {
    session.startTransaction();
    
    // Mark payment as refunded using atomic findOneAndUpdate
    const updatedPayment = await this.constructor.findOneAndUpdate(
      { _id: this._id, isRefunded: false },
      { 
        isRefunded: true,
        refundedAt: new Date(),
        refundAmount: refundAmount, // Store in kobo ONLY
        refundReason: refundReason,
        refundedBy: adminId
      },
      { session, new: true }
    );
    
    if (!updatedPayment) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw new Error("Payment already refunded or not found");
    }
    
    // Reverse wallet transaction if mentor was credited (using kobo values)
    if (this.uploaded_by === "mentor" && this.tutorEarnings > 0) {
      const Wallet = mongoose.model("Wallet");
      const wallet = await Wallet.findOne({ user: this.mentor }).session(session);
      
      if (wallet) {
        // Calculate refund proportion for mentor (using kobo values)
        const mentorRefundAmount = Math.round((this.tutorEarnings / this.amount) * refundAmount);
        
        // Reverse the earning (using kobo values)
        wallet.pendingBalance = Math.max(0, wallet.pendingBalance - mentorRefundAmount);
        wallet.totalEarnings = Math.max(0, wallet.totalEarnings - mentorRefundAmount);
        
        wallet.transactions.push({
          type: "refund",
          amount: -mentorRefundAmount, // Stored in kobo
          description: `Refund for payment: ${this.transactionRef}`,
          payment: this._id,
          status: "completed"
        });
        
        await wallet.save({ session });
      }
    }
    
    // Track platform commission reversal for audit (using kobo values)
    // Note: Platform commission is not currently credited to a wallet, but we track
    // the reversal amount for accounting purposes. If a platform wallet is added later,
    // this should reverse that wallet balance as well.
    if (this.uploaded_by === "mentor" && this.platformEarnings > 0) {
      const platformRefundAmount = Math.round((this.platformEarnings / this.amount) * refundAmount);
      
      // Store platform commission reversal in payment metadata for audit
      updatedPayment.metadata.platformRefundAmount = platformRefundAmount;
      await updatedPayment.save({ session });
    }
    
    await session.commitTransaction();
    return updatedPayment;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = mongoose.model("Payment", paymentSchema);