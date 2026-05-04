const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// @route   GET /api/search
// @desc    Global search for published courses
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length > 100) {
      return res.status(400).json({ error: "Search query is required and must be under 100 characters" });
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapeRegex(q), "i");

    const courses = await Course.find({
      isPublished: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { level: searchRegex },
      ]
    })
      .limit(10)
      .select("title description category level thumbnail price isPaid");

    const results = courses.map((course) => ({
      id: course._id,
      title: course.title,
      label: course.title,
      type: "Course",
      category: course.category,
      level: course.level,
      isPaid: course.isPaid,
      thumbnail: course.thumbnail,
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Server error during search" });
  }
});

module.exports = router;
