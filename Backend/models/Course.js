const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String },
  videoPublicId: { type: String },
  pdfUrl: { type: String },
  pdfPublicId: { type: String },
  resources: [{
    title: { type: String },
    url: { type: String },
    type: { type: String }
  }],
  duration: { type: Number },
  order: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  uploaded_by: { 
    type: String, 
    enum: ["admin", "mentor"], 
    default: "mentor",
    required: true 
  },
  category: { type: String },
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner"},
  price: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  lessons: [lessonSchema],
  totalDuration: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  wishlistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  commissionPercent: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

courseSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  this.totalLessons = this.lessons.length;
  next();
});

// ✅ Comprehensive indexes for course queries - optimized for scale
courseSchema.index({ mentor: 1, isPublished: 1 });  // Mentor's published courses
courseSchema.index({ category: 1, isPublished: 1 });  // Category browsing
courseSchema.index({ isPublished: 1, createdAt: -1 });  // Published courses sorted by date
courseSchema.index({ isPaid: 1, isPublished: 1 });  // Free vs paid filter
courseSchema.index({ createdAt: -1 });  // Recently created
courseSchema.index({ rating: -1, isPublished: 1 });  // Top-rated courses
courseSchema.index({ enrolledStudents: 1 });  // Enrollment tracking

module.exports = mongoose.model("Course", courseSchema);