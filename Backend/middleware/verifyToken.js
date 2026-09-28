const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_for_testing' : null);
if (!JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.error("FATAL: JWT_SECRET environment variable is not set.");
  process.exit(1);
}

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  // console.log("Authorization Header:", req.headers.authorization);

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const verifyAdmin = (req, res, next) => {
   verifyToken(req, res, () => {
     if (req.user.role !== "admin") return res.status(403).json({ error: "Not authorized" });
     next();
   });
 };

 const verifyStudent = (req, res, next) => {
   verifyToken(req, res, () => {
     if (req.user.role !== "student") return res.status(403).json({ error: "Not authorized as student" });
     next();
   });
 };

const verifyAuth = (req, res, next) => {
  verifyToken(req, res, () => {
    next();
  });
};

const verifyMentor = async (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      // The JWT payload only carries { id, role }. isMentorApproved is NOT
      // part of the token, so checking req.user.isMentorApproved would always
      // be undefined and reject every mentor — even approved ones. Look the
      // user up from the DB instead so the approval flag is authoritative.
      const User = require("../models/User");
      const user = await User.findById(req.user.id);
      if (!user || user.role !== "mentor" || !user.isMentorApproved) {
        return res.status(403).json({ error: "Not authorized as approved mentor" });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: "Authorization check failed" });
    }
  });
};

const verifyCourseAccess = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const course = await require("../models/Course").findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if user is admin or mentor of the course
    if (req.user.role === "admin" || req.user.role === "mentor" && course.mentor.toString() === userId) {
      return next();
    }

    // Check if user is enrolled and payment is verified
    const Payment = require("../models/Payment");
    const payment = await Payment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "success"
    });

    if (payment) {
      return next();
    }

    return res.status(403).json({ error: "Access denied. Course not purchased or not enrolled." });
  } catch (err) {
    console.error("Course access verification error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const verifyCoursePurchase = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const Payment = require("../models/Payment");
    const payment = await Payment.findOne({
      user: userId,
      course: courseId,
      paymentStatus: "success"
    });

    if (payment) {
      return next();
    }

    return res.status(403).json({ error: "Access denied. Course not purchased." });
  } catch (err) {
    console.error("Course purchase verification error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { 
   verifyToken, 
   verifyAdmin,
   verifyStudent,
   verifyMentor,
   verifyAuth,
   verifyCourseAccess,
   verifyCoursePurchase
};