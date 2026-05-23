
/**
 * Email HTML Templates for Iodlearn
 */

const resetPasswordTemplate = (link, name = "User") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Nunito', sans-serif;
      background-color: #f9f9f9;
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      background-color: #4f46e5;
      color: white;
      padding: 1.5rem 0;
      border-radius: 8px 8px 0 0;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-top: 2rem;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4f46e5;
      color: #fff;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 1rem;
    }
    .footer {
      font-size: 14px;
      color: #6b7280;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Iodlearn</h2>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to continue:</p>
      <a href="${link}" class="btn">Reset Password</a>
      <p style="margin-top: 1rem;">This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:iodlearn.com@gmail.com">iodlearn.com@gmail.com</a></p>
      <p>© 2026 Iodlearn. All rights reserved.</p>
    </div>
  </div>

</body>
</html>
`;

const otpHtmlTemplate = (otp, name = "Learner", verifyLink = "https://iodlearn.vercel.app/verify") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body {
      font-family: 'Nunito', sans-serif;
      background-color: #f4f6fb;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 680px;
      margin: 32px auto;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 28px 80px rgba(31, 41, 55, 0.08);
      background: linear-gradient(180deg, #ffffff 0%, #f7f8fb 100%);
    }

    .top-bar {
      padding: 2rem;
      background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
      color: #ffffff;
      text-align: center;
    }

    .top-bar h2 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.02em;
    }

    .top-bar p {
      margin: 0.75rem auto 0;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
      max-width: 520px;
    }

    .body {
      padding: 2rem;
      color: #1f2937;
      line-height: 1.7;
    }

    .body h3 {
      margin: 0 0 0.75rem;
      font-size: 22px;
      color: #111827;
    }

    .body p {
      margin: 0 0 1rem;
      font-size: 16px;
    }

    .otp-panel {
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: #eef2ff;
      border-radius: 18px;
      border: 1px solid rgba(79, 70, 229, 0.12);
      text-align: center;
    }

    .otp-panel p {
      margin: 0 0 1rem;
      color: #4338ca;
      font-size: 15px;
      letter-spacing: 0.03em;
    }

    .otp-code {
      display: inline-flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .otp-digit {
      width: 2.4rem;
      height: 3.4rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid rgba(79, 70, 229, 0.2);
      font-size: 22px;
      font-weight: 700;
      color: #312e81;
      box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.08);
    }

    .button {
      display: inline-block;
      margin-top: 1.75rem;
      background-color: #4f46e5;
      color: #ffffff;
      padding: 14px 28px;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
    }

    .note {
      margin-top: 1.75rem;
      font-size: 14px;
      color: #6b7280;
    }

    .support {
      margin-top: 2rem;
      padding: 1.5rem;
      border-radius: 16px;
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.05);
    }

    .support h4 {
      margin: 0 0 0.5rem;
      color: #111827;
      font-size: 16px;
    }

    .support p {
      margin: 0;
      color: #4b5563;
      font-size: 14px;
    }

    .footer {
      padding: 1.5rem 2rem 2rem;
      font-size: 13px;
      color: #6b7280;
      text-align: center;
    }

    .footer a {
      color: #4f46e5;
      text-decoration: none;
    }

    @media screen and (max-width: 600px) {
      .container {
        margin: 16px;
      }

      .otp-digit {
        width: 2.8rem;
        height: 2.8rem;
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="top-bar">
      <h2>Welcome to Iodlearn</h2>
      <p>Your premium learning platform is ready. Secure your account with the code below.</p>
    </div>
    <div class="body">
      <h3>Hi ${name},</h3>
      <p>Thank you for joining Iodlearn. We just need to verify your email address before you can access your personalized learning dashboard.</p>
      <div class="otp-panel">
        <p>Your secure verification code</p>
        <div class="otp-code">
          ${otp.split("").map((digit) => `<div class="otp-digit">${digit}</div>`).join("")}
        </div>
      </div>
      <a href="${verifyLink}" class="button">Verify your account</a>
      <p class="note">This code will expire in <strong>10 minutes</strong>. If the button above does not work, copy the code and paste it into the verification page.</p>
      <div class="support">
        <h4>Need help?</h4>
        <p>If you did not create this account, you can safely ignore this email. Otherwise, contact us at <a href="mailto:iodlearn.com@gmail.com">iodlearn.com@gmail.com</a>.</p>
      </div>
    </div>
    <div class="footer">
      © 2026 Iodlearn. All rights reserved.  |  Learn, grow, and achieve with confidence.
    </div>
  </div>
</body>
</html>
`;

// New templates for mentor application notifications
const mentorApplicationTemplate = (fullName, email, expertise, experience) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Mentor Application</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Nunito', sans-serif;
      background-color: #f9f9f9;
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      background-color: #f97316;
      color: white;
      padding: 1.5rem 0;
      border-radius: 8px 8px 0 0;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-top: 2rem;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #f97316;
      color: #fff;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 1rem;
    }
    .details {
      background: #f3f4f6;
      padding: 1rem;
      border-radius: 6px;
      margin: 1rem 0;
    }
    .details p {
      margin: 0.5rem 0;
    }
    .expertise-tag {
      display: inline-block;
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      margin: 0.25rem;
      font-size: 12px;
    }
    .footer {
      font-size: 14px;
      color: #6b7280;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Mentor Application</h2>
    </div>
    <div class="content">
      <p>A new mentor application has been submitted. Review the details below:</p>
      
      <div class="details">
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${experience ? `<p><strong>Experience:</strong> ${experience}</p>` : ''}
      </div>
      
      <p><strong>Expertise Areas:</strong></p>
      <div>
        ${expertise.map(exp => `<span class="expertise-tag">${exp}</span>`).join('')}
      </div>
      
      <p style="margin-top: 1rem;">Please review this application in the admin panel.</p>
      <a href="${process.env.ADMIN_URL || 'https://iodlearn-admin.vercel.app'}/mentors" class="btn">Review Application</a>
    </div>
    <div class="footer">
      <p>© 2026 Iodlearn. All rights reserved.</p>
    </div>
  </div>

</body>
</html>
`;

const mentorApprovedTemplate = (fullName, commissionRate = 10) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mentor Application Approved</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Nunito', sans-serif;
      background-color: #f9f9f9;
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      background-color: #10b981;
      color: white;
      padding: 1.5rem 0;
      border-radius: 8px 8px 0 0;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-top: 2rem;
    }
    .commission-box {
      background: #ecfdf5;
      border: 2px solid #10b981;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      text-align: center;
    }
    .commission-rate {
      font-size: 32px;
      font-weight: bold;
      color: #10b981;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #10b981;
      color: #fff;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 1rem;
    }
    .footer {
      font-size: 14px;
      color: #6b7280;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Application Approved!</h2>
    </div>
    <div class="content">
      <p>Congratulations, ${fullName}!</p>
      <p>Your mentor application has been <strong>approved</strong>. You can now:</p>
      <ul style="margin: 1rem 0; padding-left: 1.5rem;">
        <li>Create and publish courses</li>
        <li>Conduct mentorship sessions</li>
        <li>Earn revenue from your courses</li>
      </ul>
      
      <div class="commission-box">
        <p style="margin: 0 0 0.5rem; color: #065f46;">Your Commission Rate</p>
        <div class="commission-rate">${commissionRate}%</div>
        <p style="margin: 0.5rem 0 0; color: #065f46; font-size: 14px;">
          You keep ${(100 - commissionRate)}% of your course sales
        </p>
      </div>
      
      <a href="${process.env.CLIENT_URL || 'https://iodlearn.vercel.app'}/mentor-dashboard" class="btn">Go to Mentor Dashboard</a>
    </div>
    <div class="footer">
      <p>© 2026 Iodlearn. All rights reserved.</p>
    </div>
  </div>

</body>
</html>
`;

const mentorRejectedTemplate = (fullName, adminNotes = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mentor Application Status</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Nunito', sans-serif;
      background-color: #f9f9f9;
      padding: 0;
      margin: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      background-color: #ef4444;
      color: white;
      padding: 1.5rem 0;
      border-radius: 8px 8px 0 0;
    }
    .header h2 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin-top: 2rem;
    }
    .notes {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 1rem;
      margin: 1rem 0;
      color: #991b1b;
    }
    .footer {
      font-size: 14px;
      color: #6b7280;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Application Update</h2>
    </div>
    <div class="content">
      <p>Dear ${fullName},</p>
      <p>We regret to inform you that your mentor application has been <strong>rejected</strong>.</p>
      ${adminNotes ? `
      <div class="notes">
        <strong>Admin Notes:</strong>
        <p>${adminNotes}</p>
      </div>
      ` : ''}
      <p style="margin-top: 1rem;">You are welcome to apply again in the future with a more detailed application.</p>
    </div>
    <div class="footer">
      <p>© 2026 Iodlearn. All rights reserved.</p>
    </div>
  </div>

</body>
</html>
`;

module.exports = {
  resetPasswordTemplate,
  otpHtmlTemplate,
  mentorApplicationTemplate,
  mentorApprovedTemplate,
  mentorRejectedTemplate
};
