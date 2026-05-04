const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  title: { type: String, required: true },
  description: { type: String },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ["pending", "accepted", "declined", "completed", "cancelled"], default: "pending" },
  meetingLink: { type: String },
  notes: { type: String },
  price: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// ✅ Indexes for booking queries
bookingSchema.index({ mentor: 1, status: 1 });  // Mentor's bookings by status
bookingSchema.index({ student: 1, status: 1 });  // Student's bookings by status
bookingSchema.index({ scheduledAt: 1, status: 1 });  // Upcoming sessions
bookingSchema.index({ createdAt: -1 });  // Recently created bookings
bookingSchema.index({ paymentStatus: 1 });  // Payment filtering

module.exports = mongoose.model("Booking", bookingSchema);