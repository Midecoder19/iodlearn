const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30, 
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String },
    googleId: String,
    avatar: String,
    bio: { type: String, maxlength: 200, default: "" },
    isGoogle: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "student",
      index: true
    },
    isMentorApproved: { type: Boolean, default: false, index: true },
    mentorProfile: {
      bio: { type: String, maxlength: 1000, default: "" },
      expertise: [{ type: String }],
      experience: { type: String, default: "" },
      qualifications: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      sessionPrice: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      commissionRate: { type: Number, default: 10 }
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    verified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    resetToken: String,
    resetTokenExpires: Date,
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    usernameChanged: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);

// ✅ Comprehensive indexing for performance
// Query optimization indexes
userSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);  // Case-insensitive unique email lookups
userSchema.index({ role: 1, createdAt: -1 });  // Role-based queries with sorting
userSchema.index({ isMentorApproved: 1, role: 1 });  // Mentor filtering
userSchema.index({ createdAt: -1 });  // Recently created users
userSchema.index({ isPublic: 1, createdAt: -1 });  // Public profile sorting

module.exports = mongoose.model("User", userSchema);
