const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["earning", "withdrawal", "adjustment", "refund"], 
    required: true 
  },
  amount: { type: Number, required: true },
  description: { type: String },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed", "cancelled"], 
    default: "pending" 
  },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "completed", "failed"], 
    default: "pending" 
  },
  paymentMethod: { type: String, default: "bank_transfer" },
  bankDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    accountName: { type: String }
  },
  adminNotes: { type: String },
  processedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  pendingBalance: { type: Number, default: 0, min: 0 },
  availableBalance: { type: Number, default: 0, min: 0 },
  totalEarnings: { type: Number, default: 0, min: 0 },
  totalWithdrawn: { type: Number, default: 0, min: 0 },
  transactions: [walletTransactionSchema],
  withdrawals: [withdrawalSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

walletSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ Additional Wallet indexes for financial queries
walletSchema.index({ "transactions.status": 1, "transactions.createdAt": -1 });  // Transaction filtering
walletSchema.index({ "withdrawals.status": 1 });  // Pending withdrawal tracking

walletSchema.methods.addEarning = async function(amount, description, paymentId = null, session = null) {
  this.pendingBalance += amount;
  this.totalEarnings += amount;
  this.transactions.push({
    type: "earning",
    amount,
    description,
    payment: paymentId,
    status: "completed"
  });
  if (session) {
    await this.save({ session });
  } else {
    await this.save();
  }
};

walletSchema.methods.approveWithdrawal = async function(withdrawalId, adminId) {
  const withdrawal = this.withdrawals.id(withdrawalId);
  if (!withdrawal) throw new Error("Withdrawal not found");
  if (withdrawal.status !== "pending") throw new Error("Withdrawal already processed");
  if (withdrawal.amount > this.availableBalance) throw new Error("Insufficient balance");
  
  withdrawal.status = "approved";
  withdrawal.processedBy = adminId;
  withdrawal.processedAt = new Date();
  this.availableBalance -= withdrawal.amount;
  
  this.transactions.push({
    type: "withdrawal",
    amount: -withdrawal.amount,
    description: `Withdrawal approved: ${withdrawal._id}`,
    status: "completed"
  });
  
  await this.save();
};

walletSchema.methods.rejectWithdrawal = async function(withdrawalId, adminId, adminNotes) {
  const withdrawal = this.withdrawals.id(withdrawalId);
  if (!withdrawal) throw new Error("Withdrawal not found");
  if (withdrawal.status !== "pending") throw new Error("Withdrawal already processed");
  
  withdrawal.status = "rejected";
  withdrawal.processedBy = adminId;
  withdrawal.processedAt = new Date();
  withdrawal.adminNotes = adminNotes || "Rejected by admin";
  
  this.pendingBalance += withdrawal.amount;
  
  this.transactions.push({
    type: "withdrawal",
    amount: withdrawal.amount,
    description: `Withdrawal rejected: ${withdrawal._id}`,
    status: "cancelled"
  });
  
  await this.save();
};

walletSchema.methods.releasePendingEarnings = async function() {
  const amountToRelease = this.pendingBalance;
  this.availableBalance += amountToRelease;
  this.pendingBalance = 0;
  await this.save();
  return amountToRelease;
};

module.exports = mongoose.model("Wallet", walletSchema);