const express = require("express");
const MentorApplication = require("../models/MentorApplication");
const User = require("../models/User");
const { verifyToken } = require("../middleware/verifyToken");
const sendMail = require("../utils/sendMail");
const { mentorApplicationTemplate, mentorApprovedTemplate, mentorRejectedTemplate } = require("../utils/emailTemplates");

const router = express.Router();

router.post("/apply", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const existingUser = await User.findById(userId);
    if (existingUser.role === "mentor" && existingUser.isMentorApproved) {
      return res.status(400).json({ error: "You are already a mentor" });
    }

    const existingApplication = await MentorApplication.findOne({
      user: userId,
      status: "pending"
    });

    if (existingApplication) {
      return res.status(400).json({ error: "You have a pending application" });
    }

    const {
      fullName,
      email,
      phone,
      bio,
      expertise,
      experience,
      qualifications,
      linkedin,
      twitter,
      portfolio
    } = req.body;

    const application = new MentorApplication({
      user: userId,
      fullName,
      email,
      phone,
      bio,
      expertise,
      experience,
      qualifications,
      linkedin,
      twitter,
      portfolio,
      status: "pending"
    });

    await application.save();

    // Send email notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@iodlearn.com";
    const adminSubject = `New Mentor Application: ${fullName}`;
    const adminHtml = mentorApplicationTemplate(fullName, email, expertise, experience);

    try {
      await sendMail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtml
      });
      console.log(`Mentor application notification sent to admin at ${adminEmail}`);
    } catch (emailErr) {
      console.error("Failed to send admin notification email:", emailErr);
      // Don't fail the request if email fails
    }

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err) {
    console.error("Submit application error:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

router.get("/my-application", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const application = await MentorApplication.findOne({ user: userId })
      .sort({ createdAt: -1 });

    if (!application) {
      return res.json({ message: "No application found" });
    }

    res.json(application);
  } catch (err) {
    console.error("Get my application error:", err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
});

router.get("/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "mentor" && user.isMentorApproved) {
      return res.json({ isMentor: true, status: "approved" });
    }

    const application = await MentorApplication.findOne({
      user: userId,
      status: "pending"
    });

    if (application) {
      return res.json({ isMentor: false, status: "pending" });
    }

    res.json({ isMentor: false, status: "notApplied" });
  } catch (err) {
    console.error("Get status error:", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

module.exports = router;
