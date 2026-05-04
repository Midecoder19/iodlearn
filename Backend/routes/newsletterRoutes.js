const express = require('express');
const router = express.Router();
const sendMail = require('../utils/sendMail');
const { body, validationResult } = require('express-validator');
// Removed unused import - using inline template

router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email } = req.body;

    // Simple duplicate check (in prod use DB)
    // TODO: Add NewsletterSubscriber model

    const newsletterTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Welcome to Iodlearn Updates</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
    <h1 style="margin: 0;">Welcome to Iodlearn! 🎉</h1>
    <p style="font-size: 18px;">You've successfully subscribed to our updates</p>
  </div>
  <div style="padding: 40px 20px; background: #f8f9ff;">
    <h2>What's Next?</h2>
    <ul style="line-height: 1.8;">
      <li>✨ New course notifications</li>
      <li>📚 Exam preparation tips</li>
      <li>🎓 Mentor spotlights</li>
      <li>💰 Exclusive discounts</li>
    </ul>
    <p style="text-align: center; color: #666; margin-top: 30px;">
      You can unsubscribe anytime via the link in our emails.
    </p>
  </div>
  <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 14px;">
    © 2026 Iodlearn. All rights reserved. | iodlearn.com@gmail.com
  </div>
</body>
</html>
    `;

    await sendMail({
      to: email,
      subject: 'Welcome to Iodlearn Updates! 🎉',
      html: newsletterTemplate
    });

    res.json({ message: 'Successfully subscribed to Iodlearn updates! Check your email.' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ message: 'Subscription failed. Try again later.' });
  }
});

module.exports = router;

