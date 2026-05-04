const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const MentorApplication = require('../models/MentorApplication');
const { verifyAdmin } = require("../middleware/verifyToken");
const { validateMongoId, validatePagination } = require("../middleware/validation");
const sendMail = require("../utils/sendMail");
const { mentorApprovedTemplate, mentorRejectedTemplate } = require("../utils/emailTemplates"); 

router.put('/users/:id/role', verifyAdmin, async (req, res) => {
  const { role } = req.body;

  if (!["student", "mentor", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Role updated", user: updatedUser });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/users', verifyAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({}, 'name email role createdAt isGoogle isMentorApproved')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

router.get('/mentors', verifyAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const mentors = await User.find({ role: "mentor" }, 'name email avatar mentorProfile createdAt isMentorApproved')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments({ role: "mentor" });

    res.json({
      mentors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch mentors" });
  }
});

router.delete('/users/:id', verifyAdmin, validateMongoId, async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) return res.status(404).json({ error: "User not found" });
  
      res.status(200).json({ message: "User deleted", user: deletedUser });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalMentors, recentUsers, recentCourses, 
           revenueStats, mentorStats, courseStats, paymentStats] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      User.countDocuments({ role: "mentor", isMentorApproved: true }),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      Course.find().sort({ createdAt: -1 }).limit(5).select("title mentor price isPublished createdAt"),
      Payment.aggregate([
        { $match: { paymentStatus: "success" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalTransactions: { $sum: 1 },
            avgTransaction: { $avg: "$amount" }
          }
        }
      ]),
      User.aggregate([
        { $match: { role: "mentor", isMentorApproved: true } },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "mentor",
            as: "payments"
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            totalEarnings: { $sum: "$payments.tutorEarnings" },
            transactionCount: { $size: "$payments" }
          }
        },
        { $sort: { totalEarnings: -1 } },
        { $limit: 5 }
      ]),
      Course.aggregate([
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "course",
            as: "payments"
          }
        },
        {
          $project: {
            title: 1,
            mentor: 1,
            price: 1,
            isPublished: 1,
            totalSales: { $size: { $filter: { input: "$payments", cond: { $eq: ["$$this.paymentStatus", "success"] } } } },
            totalRevenue: { $sum: { $map: { input: { $filter: { input: "$payments", cond: { $eq: ["$$this.paymentStatus", "success"] } } }, in: "$$this.amount" } } }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 5 }
      ]),
      Payment.aggregate([
        {
          $facet: {
            statusBreakdown: [
              { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }
            ],
            monthlyRevenue: [
              { $match: { paymentStatus: "success" } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                  revenue: { $sum: "$amount" },
                  count: { $sum: 1 }
                }
              },
              { $sort: { "_id": 1 } },
              { $limit: 6 }
            ]
          }
        }
      ])
    ]);

    const revenueData = revenueStats[0] || { totalRevenue: 0, totalTransactions: 0, avgTransaction: 0 };
    const monthlyRevenue = paymentStats[0]?.monthlyRevenue || [];
    const statusBreakdown = paymentStats[0]?.statusBreakdown || [];

    res.json({
      summary: {
        totalUsers,
        totalCourses,
        totalMentors
      },
      recentActivity: {
        users: recentUsers,
        courses: recentCourses
      },
      revenue: {
        total: revenueData.totalRevenue,
        transactions: revenueData.totalTransactions,
        average: revenueData.avgTransaction,
        monthly: monthlyRevenue
      },
      topMentors: mentorStats,
      topCourses: courseStats,
      paymentStatus: statusBreakdown.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

router.get('/mentor-applications', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const applications = await MentorApplication.find(query)
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error("Get applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.put('/mentor-applications/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const applicationId = req.params.id;

    const application = await MentorApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = "approved";
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    await application.save();

    await User.findByIdAndUpdate(application.user, {
      role: "mentor",
      isMentorApproved: true,
      mentorProfile: {
        bio: application.bio,
        expertise: application.expertise,
        experience: application.experience,
        qualifications: application.qualifications,
        linkedin: application.linkedin,
        twitter: application.twitter,
        portfolio: application.portfolio
      }
    });

    // Send approval email to mentor
    const mentorUser = await User.findById(application.user);
    if (mentorUser && mentorUser.email) {
      try {
        await sendMail({
          to: mentorUser.email,
          subject: "Your Mentor Application Has Been Approved!",
          html: mentorApprovedTemplate(mentorUser.name || application.fullName)
        });
        console.log(`Approval email sent to mentor: ${mentorUser.email}`);
      } catch (emailErr) {
        console.error("Failed to send approval email:", emailErr);
      }
    }

    res.json({ message: "Mentor application approved", application });
  } catch (err) {
    console.error("Approve application error:", err);
    res.status(500).json({ error: "Failed to approve application" });
  }
});

router.put('/mentor-applications/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const applicationId = req.params.id;
    const { adminNotes } = req.body;

    const application = await MentorApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    application.status = "rejected";
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    application.adminNotes = adminNotes || "";
    await application.save();

    // Send rejection email to mentor
    const mentorUser = await User.findById(application.user);
    if (mentorUser && mentorUser.email) {
      try {
        await sendMail({
          to: mentorUser.email,
          subject: "Update on Your Mentor Application",
          html: mentorRejectedTemplate(mentorUser.name || application.fullName, adminNotes)
        });
        console.log(`Rejection email sent to mentor: ${mentorUser.email}`);
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr);
      }
    }

    res.json({ message: "Mentor application rejected", application });
  } catch (err) {
    console.error("Reject application error:", err);
    res.status(500).json({ error: "Failed to reject application" });
  }
});

router.get('/payments', verifyAdmin, validatePagination, async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) query.paymentStatus = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate("user", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);
    const totalAmount = payments
      .filter(p => p.paymentStatus === "success")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalCommission = payments
      .filter(p => p.paymentStatus === "success")
      .reduce((sum, p) => sum + (p.adminCommission || 0), 0);

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalTransactions: total,
        totalAmount,
        totalCommission
      }
    });
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

router.get('/courses', verifyAdmin, validatePagination, async (req, res) => {
  try {
    const { published, isPaid } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (published !== undefined) query.isPublished = published === "true";
    if (isPaid !== undefined) query.isPaid = isPaid === "true";

    const courses = await Course.find(query)
      .populate("mentor", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Course.countDocuments(query);

    res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

router.put('/courses/:id', verifyAdmin, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, thumbnail, category, level, price, isPaid, isPublished, lessons } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Update basic course fields
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (category !== undefined) course.category = category;
    if (level !== undefined) course.level = level;
    if (price !== undefined) course.price = Math.round(parseFloat(price) * 100); // Convert to kobo
    if (isPaid !== undefined) course.isPaid = isPaid;
    if (isPublished !== undefined) course.isPublished = isPublished;

    // Update lessons if provided
    if (lessons !== undefined) {
      course.lessons = lessons.map((lesson, index) => ({
        ...lesson,
        order: index
      }));
    }

    await course.save();

    // Populate mentor info for response
    await course.populate("mentor", "name email");

    res.json({ message: "Course updated successfully", course });
  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ error: "Failed to update course" });
  }
});

router.delete('/courses/:id', verifyAdmin, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    res.status(200).json({ message: "Course deleted", course });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

module.exports = router;
