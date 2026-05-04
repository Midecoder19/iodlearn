const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  transactionRef: { type: String, required: true, unique: true },
  idempotencyKey: { type: String, index: true },
  paystackRef: { type: String, index: true },
  paymentStatus: { 
    type: String, 
    enum: ["pending", "success", "failed", "refunded"], 
    default: "pending",
    index: true 
  },
  paymentMethod: { type: String },
  channel: { type: String },
  gatewayResponse: { type: Object },
  
  commissionRate: { type: Number, required: true },
  commissionAmount: { type: Number, default: 0 },
  tutorEarnings: { type: Number, default: 0 },
  platformEarnings: { type: Number, default: 0 },
  
  isRefunded: { type: Boolean, default: false },
  refundedAt: { type: Date },
  refundAmount: { type: Number },
  
  metadata: { type: Object, default: {} },
  
  paymentInitiatedAt: { type: Date, default: Date.now },
  paymentVerifiedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

paymentSchema.index({ user: 1, course: 1 });
paymentSchema.index({ mentor: 1 });
paymentSchema.index({ paymentStatus: 1, createdAt: -1 });
paymentSchema.index({ idempotencyKey: 1 });
paymentSchema.index({ paymentVerifiedAt: 1 });

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

module.exports = mongoose.model("Payment", paymentSchema);