const express = require("express");
const router = express.Router();
const sendMail = require("../utils/sendMail");
const { validateContact } = require("../middleware/validation");

router.post("/", validateContact, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || "iodlearn.com@gmail.com";

    await sendMail({
      to: supportEmail,
      subject: `Contact Form: ${subject}`,
      text: `From: ${name} (${email})\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    // Send confirmation to user
    await sendMail({
      to: email,
      subject: "We received your message - Iodlearn",
      text: `Hi ${name},\n\nThank you for contacting us. We've received your message and will get back to you within 24 hours.\n\nYour message:\n${message}\n\nBest regards,\nThe Iodlearn Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Thanks for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for contacting Iodlearn. We've received your message and will get back to you within 24 hours.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap; color: #374151;">${message}</p>
          </div>
          <p>Best regards,<br />The Iodlearn Team</p>
        </div>
      `,
    });

    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;