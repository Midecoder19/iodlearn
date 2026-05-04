const express = require("express");
const UserProgress = require("../models/UserProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const { verifyToken } = require("../middleware/verifyToken");

const router = express.Router();

router.post("/:courseId/complete-lesson", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const { lessonId } = req.body;

    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ error: "Not enrolled in this course" });
    }

    let progress = await UserProgress.findOne({ user: userId, course: courseId });

    if (!progress) {
      progress = new UserProgress({
        user: userId,
        course: courseId,
        completedLessons: []
      });
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    const course = await Course.findById(courseId);
    if (course && course.lessons.length > 0) {
      progress.progressPercent = Math.round(
        (progress.completedLessons.length / course.lessons.length) * 100
      );

      if (progress.progressPercent === 100) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
      }
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json({ message: "Lesson marked as completed", progress });
  } catch (err) {
    console.error("Complete lesson error:", err);
    res.status(500).json({ error: "Failed to mark lesson as completed" });
  }
});

router.post("/:courseId/complete-resource", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;
    const { lessonId, resourceIndex } = req.body;

    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ error: "Not enrolled in this course" });
    }

    let progress = await UserProgress.findOne({ user: userId, course: courseId });

    if (!progress) {
      progress = new UserProgress({
        user: userId,
        course: courseId,
        completedLessons: [],
        completedResources: []
      });
    }

    const existingResource = progress.completedResources.find(
      r => r.lessonId.toString() === lessonId && r.resourceIndex === resourceIndex
    );

    if (!existingResource) {
      progress.completedResources.push({ lessonId, resourceIndex });
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json({ message: "Resource marked as completed", progress });
  } catch (err) {
    console.error("Complete resource error:", err);
    res.status(500).json({ error: "Failed to mark resource as completed" });
  }
});

router.get("/:courseId", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      return res.status(403).json({ error: "Not enrolled in this course" });
    }

    const progress = await UserProgress.findOne({ user: userId, course: courseId });

    if (!progress) {
      return res.json({
        completedLessons: [],
        progressPercent: 0,
        isCompleted: false
      });
    }

    res.json(progress);
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const progressList = await UserProgress.find({ user: userId })
      .populate("course", "title thumbnail totalLessons")
      .sort({ lastAccessedAt: -1 });

    res.json(progressList);
  } catch (err) {
    console.error("Get all progress error:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;