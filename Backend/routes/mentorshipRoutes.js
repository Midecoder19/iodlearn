const express = require("express");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Course = require("../models/Course");
const { verifyToken, verifyMentor } = require("../middleware/verifyToken");

const router = express.Router();

router.post("/request", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { mentorId, courseId, title, description, scheduledAt, duration, notes } = req.body;

    const mentor = await User.findOne({ _id: mentorId, role: "mentor", isMentorApproved: true });
    if (!mentor) {
      return res.status(404).json({ error: "Mentor not found or not approved" });
    }

    const price = mentor.mentorProfile?.sessionPrice || 0;

    const booking = new Booking({
      mentor: mentorId,
      student: userId,
      course: courseId || null,
      title,
      description,
      scheduledAt,
      duration: duration || 60,
      price,
      notes,
      status: "pending",
      paymentStatus: price > 0 ? "pending" : "pending"
    });

    await booking.save();

    res.status(201).json({ message: "Session request sent", booking });
  } catch (err) {
    console.error("Request booking error:", err);
    res.status(500).json({ error: "Failed to request session" });
  }
});

router.put("/:id/accept", verifyToken, verifyMentor, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { meetingLink } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Booking is not pending" });
    }

    booking.status = "accepted";
    booking.meetingLink = meetingLink || "";
    await booking.save();

    res.json({ message: "Booking accepted", booking });
  } catch (err) {
    console.error("Accept booking error:", err);
    res.status(500).json({ error: "Failed to accept booking" });
  }
});

router.put("/:id/decline", verifyToken, verifyMentor, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Booking is not pending" });
    }

    booking.status = "declined";
    booking.notes = reason || "Declined by mentor";
    await booking.save();

    res.json({ message: "Booking declined", booking });
  } catch (err) {
    console.error("Decline booking error:", err);
    res.status(500).json({ error: "Failed to decline booking" });
  }
});

router.put("/:id/complete", verifyToken, verifyMentor, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    booking.status = "completed";
    await booking.save();

    const mentor = await User.findById(userId);
    mentor.mentorProfile.totalSessions = (mentor.mentorProfile.totalSessions || 0) + 1;
    await mentor.save();

    res.json({ message: "Booking marked as completed", booking });
  } catch (err) {
    console.error("Complete booking error:", err);
    res.status(500).json({ error: "Failed to complete booking" });
  }
});

router.put("/:id/cancel", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.student.toString() !== userId && booking.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (booking.status !== "pending" && booking.status !== "accepted") {
      return res.status(400).json({ error: "Cannot cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

router.get("/my-sessions", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.query;

    let query;
    if (role === "mentor") {
      query = { mentor: userId };
    } else {
      query = { student: userId };
    }

    const bookings = await Booking.find(query)
      .populate("mentor", "name avatar mentorProfile")
      .populate("student", "name email avatar")
      .populate("course", "title")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Get my sessions error:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate("mentor", "name avatar mentorProfile")
      .populate("student", "name email avatar")
      .populate("course", "title");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.student.toString() !== userId && booking.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    res.json(booking);
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

module.exports = router;