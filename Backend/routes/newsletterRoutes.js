const express = require('express');
const router = express.Router();
const sendMail = require('../utils/sendMail');
const { body, validationResult } = require('express-validator');

router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email } = req.body;

    const newsletterTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Iodlearn Updates</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background-color: #f4f6fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .top-bar { background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
    .top-bar h1 { margin: 0; font-size: 28px; }
    .top-bar p { margin: 10px 0 0; font-size: 18px; color: rgba(255,255,255,0.95); }
    .body { padding: 40px 20px; background: #f8f9ff; }
    .body h2 { margin: 0 0 16px; font-size: 22px; color: #111827; }
    .body ul { margin: 0; padding-left: 20px; line-height: 1.8; color: #374151; }
    .note { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
    .footer { background: #1f2937; color: #d1d5db; text-align: center; padding: 20px; font-size: 14px; }
    @media screen and (max-width: 600px) {
      .top-bar { padding: 28px 16px; }
      .top-bar h1 { font-size: 24px; }
      .body { padding: 28px 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td>
          <div class="top-bar">
            <h1>Welcome to Iodlearn</h1>
            <p>You have successfully subscribed to our updates</p>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="body">
            <h2>What is next?</h2>
            <ul>
              <li>New course notifications</li>
              <li>Exam preparation tips</li>
              <li>Mentor spotlights</li>
              <li>Exclusive discounts</li>
            </ul>
            <p class="note">You can unsubscribe at any time via the link in our emails.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="footer">
            &copy; 2026 Iodlearn. All rights reserved. | iodlearn.com@gmail.com
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
    `;

    await sendMail({
      to: email,
      subject: 'Welcome to Iodlearn Updates',
      html: newsletterTemplate
    });

    res.json({ message: 'Successfully subscribed to Iodlearn updates! Check your email.' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ message: 'Subscription failed. Try again later.' });
  }
});

module.exports = router;