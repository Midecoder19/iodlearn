const Payment = require("../models/Payment");
const User = require("../models/User");
const Course = require("../models/Course");

const verifyPayment = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET;
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      req.user = user;
      req.course = course;
      return next();
    }

    if (course.mentor.toString() === userId) {
      req.user = user;
      req.course = course;
      return next();
    }

    if (!course.isPublished) {
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Course not published" });
      }
    }

    const payment = await Payment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "success"
    });

    if (!payment) {
      const freeEnrollment = user.enrolledCourses.includes(courseId);
      if (!course.isPaid && !freeEnrollment) {
        return res.status(403).json({ message: "Enrollment required" });
      }
      if (course.isPaid && !freeEnrollment) {
        return res.status(403).json({ message: "Payment required" });
      }
    }

    req.user = user;
    req.course = course;
    req.payment = payment;
    next();
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Access verification failed" });
  }
};

const verifyEnrolled = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET;
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isEnrolled = user.enrolledCourses.some(id => id.toString() === courseId);
    const isPurchased = user.purchasedCourses?.some(id => id.toString() === courseId);

    if (!isEnrolled && !isPurchased) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    req.enrolledUser = user;
    next();
  } catch (err) {
    res.status(500).json({ message: "Enrollment verification failed" });
  }
};

const verifyMentorAccess = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET;
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "mentor" && user.role !== "admin") {
      return res.status(403).json({ message: "Mentor access required" });
    }

    if (user.role === "mentor" && !user.isMentorApproved) {
      return res.status(403).json({ message: "Mentor not approved" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Access verification failed" });
  }
};

module.exports = {
  verifyPayment,
  verifyEnrolled,
  verifyMentorAccess
};