/* EMAIL TEMPLATE - MENTOR APPLICATION NOTIFICATION
   File: Backend/utils/emailTemplates.js
   Lines: 272-376
*/

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

// Usage in code:
// sendMail({
//   to: ADMIN_EMAIL,
//   subject: 'New Mentor Application',
//   html: mentorApplicationTemplate(fullName, email, expertise, experience)
// });
