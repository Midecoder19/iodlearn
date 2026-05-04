const mongoose = require("mongoose");

const mentorApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  bio: { type: String, required: true },
  expertise: [{ type: String }],
  experience: { type: String },
  qualifications: [{ type: String }],
  linkedin: { type: String },
  twitter: { type: String },
  portfolio: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  adminNotes: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

mentorApplicationSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("MentorApplication", mentorApplicationSchema);