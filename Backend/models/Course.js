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

// ✅ SCHEMA-LEVEL SAFEGUARD: Enforce mentor approval on publish
courseSchema.pre("save", async function(next) {
  // Only validate if isPublished is being set to true
  if (this.isPublished && this.uploaded_by === "mentor") {
    const User = mongoose.model("User");
    const mentor = await User.findById(this.mentor);
    
    if (!mentor || !mentor.isMentorApproved) {
      const error = new Error(
        `Cannot publish course: Mentor must be approved. Current approval status: ${mentor?.isMentorApproved || false}`
      );
      error.name = "MentorNotApprovedException";
      error.statusCode = 403;
      return next(error);
    }
  }
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
courseSchema.index({ uploaded_by: 1, isPublished: 1 });  // Filter by uploader type

// ✅ Static helper method for student-facing queries with mentor approval check
// Approach (b): Using aggregation pipeline with $lookup for efficient mentor approval filtering
courseSchema.statics.findVisibleToStudents = async function(filter = {}, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 }
  } = options;

  const skip = (page - 1) * limit;

  // Build aggregation pipeline for student-visible courses
  const pipeline = [
    // Step 1: Match published courses and any other filters
    {
      $match: {
        isPublished: true,
        ...filter
      }
    },
    // Step 2: Lookup mentor info to check approval status
    {
      $lookup: {
        from: "users",
        localField: "mentor",
        foreignField: "_id",
        as: "mentorData"
      }
    },
    // Step 3: Unwind mentor data (should always have 1 result for valid courses)
    {
      $unwind: {
        path: "$mentorData",
        preserveNullAndEmptyArrays: false  // Exclude courses with missing mentors
      }
    },
    // Step 4: Filter: Show only if (admin-uploaded) OR (mentor-uploaded AND mentor approved)
    {
      $match: {
        $or: [
          { uploaded_by: "admin" },  // Admin courses always visible
          { "mentorData.isMentorApproved": true }  // Mentor courses only if approved
        ]
      }
    },
    // Step 5: Remove the mentorData array from response (cleanup)
    {
      $project: {
        mentorData: 0
      }
    },
    // Step 6: Sort
    {
      $sort: sort
    },
    // Step 7: Paginate
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ];

  return this.aggregate(pipeline).exec();
};

// ✅ Static helper for getting total count of visible courses (for pagination)
courseSchema.statics.countVisibleToStudents = async function(filter = {}) {
  const pipeline = [
    {
      $match: {
        isPublished: true,
        ...filter
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "mentor",
        foreignField: "_id",
        as: "mentorData"
      }
    },
    {
      $unwind: {
        path: "$mentorData",
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $match: {
        $or: [
          { uploaded_by: "admin" },
          { "mentorData.isMentorApproved": true }
        ]
      }
    },
    {
      $count: "total"
    }
  ];

  const result = await this.aggregate(pipeline).exec();
  return result.length > 0 ? result[0].total : 0;
};

module.exports = mongoose.model("Course", courseSchema);
