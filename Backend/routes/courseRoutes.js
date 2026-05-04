const express = require("express");
const Payment = require("../models/Payment");
const Course = require("../models/Course");
const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const { verifyToken, verifyMentor, verifyAdmin, verifyCourseAccess, verifyCoursePurchase } = require("../middleware/verifyToken");
const { validateCourse, validateLesson, validateMongoId, validateReview, validatePagination } = require("../middleware/validation");

const router = express.Router();

router.post("/", verifyToken, validateCourse, async (req, res) => {
   try {
     const userId = req.user.id;

     const { title, description, thumbnail, category, level, price = 0, isPaid = false } = req.body;

     const course = new Course({
       title,
       description,
       thumbnail,
       category,
       level,
       price,
       isPaid,
       mentor: userId,
       isPublished: false,
       lessons: []
     });

     await course.save();

     await User.findByIdAndUpdate(userId, {
       $addToSet: { createdCourses: course._id }
     });

     res.status(201).json({ message: "Course created successfully", course });
   } catch (err) {
     console.error("Create course error:", err);
     res.status(500).json({ error: "Failed to create course" });
   }
 });

router.put("/:id", verifyToken, validateMongoId, async (req, res) => {
   try {
     const userId = req.user.id;
     const courseId = req.params.id;

     const course = await Course.findById(courseId);
     if (!course) {
       return res.status(404).json({ error: "Course not found" });
     }

     // Only allow mentors/admins or course mentors to update
     if (req.user.role !== "admin" && course.mentor.toString() !== userId) {
       return res.status(403).json({ error: "Not authorized to update this course" });
     }

     const { title, description, thumbnail, category, level, price, isPaid, isPublished } = req.body;

     if (title !== undefined) course.title = title;
     if (description !== undefined) course.description = description;
     if (thumbnail !== undefined) course.thumbnail = thumbnail;
     if (category !== undefined) course.category = category;
     if (level !== undefined) course.level = level;
     if (price !== undefined) course.price = price;
     if (isPaid !== undefined) course.isPaid = isPaid;
     if (isPublished !== undefined) course.isPublished = isPublished;

     await course.save();

     res.json({ message: "Course updated successfully", course });
   } catch (err) {
     console.error("Update course error:", err);
     res.status(500).json({ error: "Failed to update course" });
   }
 });

router.delete("/:id", verifyToken, validateMongoId, async (req, res) => {
   try {
     const userId = req.user.id;
     const courseId = req.params.id;

     const course = await Course.findById(courseId);
     if (!course) {
       return res.status(404).json({ error: "Course not found" });
     }

     // Only allow mentors/admins or course mentors to delete
     if (req.user.role !== "admin" && course.mentor.toString() !== userId) {
       return res.status(403).json({ error: "Not authorized to delete this course" });
     }

     await Course.findByIdAndDelete(courseId);

     await User.findByIdAndUpdate(userId, {
       $pull: { createdCourses: courseId }
     });

     res.json({ message: "Course deleted successfully" });
   } catch (err) {
     console.error("Delete course error:", err);
     res.status(500).json({ error: "Failed to delete course" });
   }
 });

router.post("/:id/lessons", verifyToken, verifyMentor, validateMongoId, validateLesson, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to add lessons" });
    }

    const { title, description, videoUrl, videoPublicId, pdfUrl, pdfPublicId, resources, duration, isFree } = req.body;

    const lesson = {
      title,
      description,
      videoUrl,
      videoPublicId,
      pdfUrl,
      pdfPublicId,
      resources,
      duration,
      isFree,
      order: course.lessons.length + 1
    };

    course.lessons.push(lesson);
    await course.save();

    res.status(201).json({ message: "Lesson added successfully", course });
  } catch (err) {
    console.error("Add lesson error:", err);
    res.status(500).json({ error: "Failed to add lesson" });
  }
});

router.put("/:courseId/lessons/:lessonId", verifyToken, verifyMentor, validateMongoId, validateLesson, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to update lessons" });
    }

    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const { title, description, videoUrl, videoPublicId, pdfUrl, pdfPublicId, resources, duration, isFree, order } = req.body;

    if (title !== undefined) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (videoPublicId !== undefined) lesson.videoPublicId = videoPublicId;
    if (pdfUrl !== undefined) lesson.pdfUrl = pdfUrl;
    if (pdfPublicId !== undefined) lesson.pdfPublicId = pdfPublicId;
    if (resources !== undefined) lesson.resources = resources;
    if (duration !== undefined) lesson.duration = duration;
    if (isFree !== undefined) lesson.isFree = isFree;
    if (order !== undefined) lesson.order = order;

    await course.save();

    res.json({ message: "Lesson updated successfully", course });
  } catch (err) {
    console.error("Update lesson error:", err);
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

router.delete("/:courseId/lessons/:lessonId", verifyToken, verifyMentor, validateMongoId, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, lessonId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.mentor.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete lessons" });
    }

    course.lessons.pull(lessonId);
    await course.save();

    res.json({ message: "Lesson deleted successfully", course });
  } catch (err) {
    console.error("Delete lesson error:", err);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const courses = await Course.find(query)
      .populate("mentor", "name avatar mentorProfile")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.get("/my-created", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const courses = await Course.find({ mentor: userId })
      .populate("mentor", "name avatar mentorProfile")
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    console.error("Get my created courses error:", err);
    res.status(500).json({ error: "Failed to fetch created courses" });
  }
});

router.get("/my-courses", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("purchasedCourses", "title description thumbnail price level category mentor");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.purchasedCourses);
  } catch (err) {
    console.error("Get my courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.post("/:id/wishlist", verifyToken, validateMongoId, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const user = await User.findById(userId);
    const isWishlisted = user.wishlist.includes(courseId);

    if (isWishlisted) {
      user.wishlist.pull(courseId);
      course.wishlistedBy.pull(userId);
    } else {
      user.wishlist.addToSet(courseId);
      course.wishlistedBy.addToSet(userId);
    }

    await user.save();
    await course.save();

    res.json({ message: isWishlisted ? "Removed from wishlist" : "Added to wishlist", wishlisted: !isWishlisted });
  } catch (err) {
    console.error("Toggle wishlist error:", err);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
});

router.get("/user/wishlist", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist", "title description thumbnail price level category mentor");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ courses: user.wishlist });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

router.post("/:id/enroll", verifyToken, validateMongoId, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.isPaid && course.price > 0) {
      return res.status(400).json({ error: "This course requires payment" });
    }

    const user = await User.findById(userId);
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    user.enrolledCourses.addToSet(courseId);
    user.purchasedCourses.addToSet(courseId);
    course.enrolledStudents.addToSet(userId);
    await user.save();
    await course.save();

    res.json({ message: "Enrolled in course successfully" });
  } catch (err) {
    console.error("Enroll free course error:", err);
    res.status(500).json({ error: "Failed to enroll in course" });
  }
});

router.post("/:id/review", verifyToken, validateMongoId, validateReview, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;
    const { rating, comment } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ error: "Only enrolled students can review this course" });
    }

    const existingReview = course.reviews.find((review) => review.user.toString() === userId);
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.createdAt = new Date();
    } else {
      course.reviews.push({ user: userId, rating, comment });
      course.ratingCount += 1;
    }

    course.rating = course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length;
    await course.save();

    res.json({ message: "Review submitted successfully", course });
  } catch (err) {
    console.error("Submit review error:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.get("/:id/enrolled", verifyToken, validateMongoId, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const courseId = req.params.id;
    const enrolled = user.enrolledCourses.includes(courseId);
    res.json({ enrolled });
  } catch (err) {
    console.error("Check enrolled error:", err);
    res.status(500).json({ error: "Failed to check enrollment" });
  }
});

router.get("/:id", validateMongoId, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("mentor", "name avatar mentorProfile")
      .populate("reviews.user", "name avatar");
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Get course by id error:", err);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

router.get("/my-courses", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("purchasedCourses", "title description thumbnail price level category mentor");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ courses: user.purchasedCourses });
  } catch (err) {
    console.error("Get my courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

module.exports = router;
