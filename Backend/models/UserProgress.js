const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  completedResources: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId },
    resourceIndex: { type: Number }
  }],
  progressPercent: { type: Number, default: 0 },
  lastAccessedAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userProgressSchema.index({ user: 1, course: 1 }, { unique: true });
// ✅ Additional indexes for progress queries
userProgressSchema.index({ course: 1, isCompleted: 1 });  // Completion tracking per course
userProgressSchema.index({ user: 1, isCompleted: 1 });  // User's completed courses
userProgressSchema.index({ lastAccessedAt: -1 });  // Recently accessed courses

userProgressSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("UserProgress", userProgressSchema);