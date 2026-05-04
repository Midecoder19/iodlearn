const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');

// @route   GET /api/stats
// @desc    Get public counts for various entities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalMentors] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      User.countDocuments({ role: 'mentor', isMentorApproved: true })
    ]);

    res.status(200).json({
      users: totalUsers,
      courses: totalCourses,
      mentors: totalMentors
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;
