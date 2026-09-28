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

/**
 * Allows an approved mentor OR an admin to proceed. Used for course creation
 * where the product rule is: "approved mentors may create their own courses;
 * admins may create courses on behalf of anyone." Students and unapproved
 * mentors are rejected.
 */
const verifyMentorOrAdmin = async (req, res, next) => {
  verifyToken(req, res, async () => {
    try {
      if (req.user.role === "admin") return next();
      const User = require("../models/User");
      const user = await User.findById(req.user.id);
      if (user && user.role === "mentor" && user.isMentorApproved) return next();
      return res.status(403).json({ error: "Not authorized" });
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

/**
 * Course-detail access guard. Public visitors may only read courses that are
 * published. Draft/unpublished courses are visible only to the course owner
 * (the mentor who created it) or an admin. This closes the gap where the
 * list endpoint filtered on isPublished but the detail endpoint did not.
 *
 * Runs verifyToken optionally so unauthenticated callers are still handled
 * (they simply have no req.user and are treated as public visitors).
 */
const verifyCourseOwnerOrAdmin = async (req, res, next) => {
  try {
    const Course = require("../models/Course");
    const courseId = req.params.id || req.params.courseId;
    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.isPublished) return next();

    // Unpublished: only the course owner or an admin may view it.
    if (req.user && req.user.role === "admin") return next();
    if (req.user && req.user.id && course.mentor && course.mentor.toString() === req.user.id) {
      return next();
    }

    return res.status(403).json({ error: "Access denied. Course not published." });
  } catch (err) {
    console.error("Course access verification error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

const verifyCourseDetail = (req, res, next) => {
  // verifyToken returns 401 when no token is present, which would block
  // unauthenticated public visitors from reading published courses. Skip the
  // token check entirely when the Authorization header is absent and let
  // verifyCourseOwnerOrAdmin decide based on req.user (which will be
  // undefined for public callers).
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return verifyCourseOwnerOrAdmin(req, res, next);
  }
  verifyToken(req, res, () => verifyCourseOwnerOrAdmin(req, res, next));
};

module.exports = { 
   verifyToken, 
   verifyAdmin,
   verifyStudent,
   verifyMentor,
   verifyAuth,
   verifyCourseAccess,
   verifyCoursePurchase,
   verifyMentorOrAdmin,
   verifyCourseOwnerOrAdmin,
   verifyCourseDetail
};