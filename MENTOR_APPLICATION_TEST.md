MENTOR APPLICATION TEST
═══════════════════════

ISSUE: Mentor application submission was failing because routes were not registered in Backend/index.js

FIX APPLIED:
-----------
✅ Added to Backend/index.js:
  - app.use("/api/mentor-application", require("./routes/mentorApplicationRoutes"));
  - app.use("/api/mentorship", require("./routes/mentorshipRoutes"));

ENDPOINTS NOW AVAILABLE:
════════════════════════

1. POST /api/mentor-application/apply
   - Submit mentor application
   - Requires JWT authentication
   - Body: { fullName, email, phone, bio, expertise[], experience, qualifications[], linkedin, twitter, portfolio }

2. GET /api/mentor-application/my-application
   - Get current user's application status
   - Requires JWT authentication

3. GET /api/mentor-application/status/:userId
   - Check if user is mentor/approval status

4. POST /api/mentorship/request
   - Request mentorship session
   - Requires JWT authentication

5. Other mentorship endpoints (see mentorshipRoutes.js)

HOW TO TEST:
============

Option 1: Via Frontend (Recommended)
------------------------------------
1. Login to frontend: https://iodlearn.vercel.app/login
2. Navigate to "Become a Mentor" page
3. Fill application form:
   - Full Name: Test Mentor
   - Email: test@email.com
   - Phone: +1234567890
   - Bio: Experienced instructor with 10+ years
   - Expertise: ["Web Development", "Programming"]
   - Experience: 10 years in tech industry
   - Qualifications: BSc Computer Science
4. Submit

Expected: "Application submitted successfully" message

Option 2: Via API (Direct Test)
--------------------------------
You need a valid JWT token from a logged-in user.

Step 1: Login
  POST https://iodlearn.onrender.com/api/auth/login
  Body: {"email": "student@demo.com", "password": "student123"}
  
  Response will contain token

Step 2: Submit Application
  POST https://iodlearn.onrender.com/api/mentor-application/apply
  Headers:
    Authorization: Bearer <YOUR_JWT_TOKEN>
    Content-Type: application/json
  Body:
  {
    "fullName": "Test Mentor",
    "email": "test@email.com",
    "phone": "+1234567890",
    "bio": "Experienced instructor with 10+ years of teaching",
    "expertise": ["Web Development", "JavaScript", "React"],
    "experience": "10 years in full-stack development",
    "qualifications": ["BSc Computer Science", "MSc Software Engineering"],
    "linkedin": "https://linkedin.com/in/test",
    "twitter": "",
    "portfolio": "https://testportfolio.com"
  }

Expected Response (201):
{
  "message": "Application submitted successfully",
  "application": {
    "user": "<user_id>",
    "fullName": "Test Mentor",
    "email": "test@email.com",
    "bio": "Experienced instructor...",
    "expertise": ["Web Development", "JavaScript", "React"],
    "status": "pending",
    "createdAt": "...",
    "updatedAt": "..."
  }
}

ADDITIONAL FUNCTIONALITY:
========================

After submission:
1. Admin receives email notification (if email configured)
2. Application visible in Admin → Mentor Management
3. Admin can Approve or Reject
4. User receives email notification of decision
5. Approved users can create courses

FILES MODIFIED:
===============

✅ Backend/index.js - Added route registrations:
   - /api/mentor-application/* routes
   - /api/mentorship/* routes

No other changes needed - all other code was already in place!
