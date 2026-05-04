# Complete End-to-End Testing Guide
## For Client Demo - Tonight

---

## Pre-Deployment Checklist

Before testing, ensure:

1. ✅ All code changes are committed and pushed
2. ✅ Vercel deployments are triggered/updated
3. ✅ Render backend is running
4. ✅ Environment variables are set correctly
5. ✅ Database (MongoDB) is accessible
6. ✅ Email service (Brevo) is configured

---

## Quick Health Check (5 minutes)

### 1. Verify Backend is Running
```bash
curl https://iodlearn.onrender.com/api/health
```
Expected: `{"status":"OK","timestamp":"..."}`

### 2. Check Frontend Loads
- Open: https://iodlearn.vercel.app
- Should see homepage without errors
- Console should have no red errors

### 3. Check Admin Panel Loads  
- Open: https://iodlearn-admin.vercel.app
- Should see login page without 404 errors
- **This is the critical fix!**

---

## Complete Test Flow

### Test 1: User Registration & Email Verification

**Time:** 5-10 minutes

**Steps:**

1. Navigate to https://iodlearn.vercel.app
2. Click "Register" or go to `/register`
3. Fill in:
   - Name: `Test User Demo`
   - Email: `test.user.demo+${Date.now()}@gmail.com` (use unique email)
   - Password: `Demo123456!`
4. Click "Register"
5. **Expected:** Success message "Registration successful. Check your email"
6. Check email inbox (and spam) for verification code
7. Enter the 6-digit OTP on the verification page
8. **Expected:** "Email verified successfully" message, redirected to login

**Common Issues:**
- ❌ No email received → Check Brevo API key, email settings
- ❌ OTP verification fails → Check Redis connection
- ❌ 404 on verify page → Check Frontend build/deployment

---

### Test 2: User Login

**Time:** 2-3 minutes

**Prerequisite:** User registered and verified (Test 1)

**Steps:**

1. Go to `/login` page
2. Enter email and password from Test 1
3. Click "Login"
4. **Expected:** Redirected to homepage, user is logged in
5. Verify user profile shows in header
6. Check that:
   - Courses page loads
   - User can navigate without issues
   - No API errors in console (F12)

**Common Issues:**
- ❌ "Invalid credentials" → Check password hashing
- ❌ "Please verify email first" → Complete Test 1
- ❌ Login loop → Check JWT token in localStorage

---

### Test 3: Forgot Password Flow

**Time:** 5-8 minutes

**Prerequisite:** User exists and is verified

**Steps:**

1. Go to `/forgot-password`
2. Enter registered email
3. Click "Send Reset Link"
4. **Expected:** "Reset link sent" message
5. Check email for password reset link
6. Click the link in email (should open browser)
7. Enter new password twice
8. Click "Reset Password"
9. **Expected:** "Password reset successfully" message
10. Go to login page, verify can login with new password

**Common Issues:**
- ❌ Reset link not received → Check CLIENT_URL in Backend .env
- ❌ Link is localhost → Backend .env has wrong CLIENT_URL
- ❌ Link expires → Check token expiry (10 min default)
- ❌ Reset fails → Check database connection

---

### Test 4: Browse & Enroll in Free Course

**Time:** 3-5 minutes

**Prerequisite:** User logged in

**Steps:**

1. Navigate to "Courses" page
2. Verify courses are displayed (6 demo courses)
3. Find a course marked as "Free" or with lock icon
4. Click on course to view details
5. Click "Enroll" or "Start Learning"
6. **Expected:** Course is added to "My Courses"
7. Navigate to "My Courses" or "Dashboard"
8. Verify enrolled course appears there
9. Click course, verify lessons can be accessed

**Common Issues:**
- ❌ No courses showing → Check database seeding
- ❌ Enroll button missing → Check course pricing/isPaid field
- ❌ API errors → Check Backend is running

---

### Test 5: Paid Course Checkout (Critical!)

**Time:** 5-10 minutes

**Prerequisite:** User logged in

**Steps:**

1. Find a paid course (price > 0)
2. Click "Enroll" or "Buy Now"
3. Should redirect to Paystack payment page
4. **⚠️ Use Paystack test card:**
   - Card: `4084084084084081`
   - Expiry: Any future date (e.g., 12/30)
   - CVV: `123`
   - OTP: `123456` (will fail, but that's OK for demo)
5. After payment attempt, should return to site
6. Check "Payment History" or "My Courses"

**Alternative Test (No Card):**
1. Try to enroll in paid course
2. Verify payment modal/redirect opens
3. Cancel payment
4. Verify course is NOT added to enrolled courses

**Common Issues:**
- ❌ Paystack not loading → Check PAYSTACK_PUBLIC_KEY
- ❌ Payment callback fails → Check CLIENT_BASE_URL
- ❌ Course not unlocking after payment → Check webhook
- ❌ "Course is free" error → Check course price/isPaid field

---

### Test 6: Mentor Application (Optional)

**Time:** 3-5 minutes

**Steps:**

1. Log in as student
2. Navigate to "Mentor" or "Become a Mentor" page
3. Fill application form:
   - Expertise areas (select multiple)
   - Experience description
   - Any additional info
4. Submit
5. **Expected:** "Application submitted" message
6. Check Admin panel for application

**Admin Review:**
1. Login to Admin panel (see below)
2. Go to "Mentor Applications"
3. Verify application appears
4. Approve or reject
5. Check if applicant receives email

**Common Issues:**
- ❌ Application not saving → Check database
- ❌ No email to admin → Check ADMIN_URL, email template
- ❌ Admin can't see → Check user role/permissions

---

### Test 7: Admin Panel Login (THE CRITICAL TEST!)

**Time:** 2-3 minutes

**This verifies the 404 fix!**

**Steps:**

1. Open https://iodlearn-admin.vercel.app
2. **Expected:** Login page loads (NO 404 ERROR! ✅)
3. Login credentials (create if needed):
   - Email: `admin@demo.com`
   - Password: `admin123`
   - (Or use existing admin account)
4. Click "Login"
5. **Expected:** Redirected to dashboard
6. Verify can navigate to:
   - Dashboard (overview stats)
   - Users management
   - Courses management
   - Mentor applications
   - Payments/Analytics

**Common Issues:**
- ❌ 404 on page load → Vercel config missing (our fix addresses this)
- ❌ 404 on navigation → SPA routing not configured
- ❌ Login fails → Check admin user exists in DB
- ❌ No data in dashboard → Check API endpoints

---

### Test 8: Admin Panel Features

**Time:** 5-10 minutes

**Prerequisite:** Admin logged in

**Tests:**

1. **View Dashboard Stats**
   - Check total users, courses, revenue
   - Verify charts load

2. **User Management**
   - Search for user
   - Change user role (student ↔ mentor)
   - Delete user (optional)

3. **Course Management**
   - View all courses
   - Approve/reject courses
   - Edit course details

4. **Mentor Applications**
   - View pending applications
   - Approve with "Approve" button
   - Verify approval email sent

5. **Payments/Analytics**
   - View payment history
   - Check revenue charts

**Common Issues:**
- ❌ API calls fail → Check CORS settings
- ❌ Data not loading → Check Backend routes
- ❌ Actions not working → Check user permissions

---

## Test All API Endpoints

**Time:** 10 minutes

Verify these key endpoints respond:

```bash
# Health check
curl https://iodlearn.onrender.com/api/health

# Public endpoints (no auth)
curl https://iodlearn.onrender.com/api/courses
curl https://iodlearn.onrender.com/api/categories
curl https://iodlearn.onrender.com/api/newsletter/subscribe

# Auth endpoints (test with valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://iodlearn.onrender.com/api/auth/profile/username
```

---

## Email Testing

**Check these emails can send:**

1. ✅ Registration verification OTP
2. ✅ Password reset link
3. ✅ Mentor application notification (to admin)
4. ✅ Mentor approval/rejection (to applicant)

**If emails not working:**
- Verify Brevo API key in Backend .env
- Check FROM_EMAIL is valid
- Check email is not in spam
- Review sendMail.js configuration

---

## Performance & Cross-Browser Check

**Quick Tests:**

1. **Load Time**
   - Frontend should load in < 3 seconds
   - API calls should respond in < 1 second

2. **Mobile Responsiveness**
   - Test on phone or Chrome DevTools mobile view
   - All pages should be usable

3. **Browser Compatibility**
   - Chrome (latest) ✅
   - Firefox ✅
   - Safari ✅
   - Edge ✅

---

## Error Handling Tests

**Verify these fail gracefully:**

1. Wrong login credentials → Clear error message
2. Invalid OTP → "Invalid or expired code"
3. Expired reset link → "Invalid or expired token"
4. Unauthorized API access → 401/403 error
5. Non-existent page → Custom 404 (not ugly server error)

---

## Database Checks

**Verify:**

1. MongoDB connection is stable
2. User registrations save correctly
3. Course enrollments update correctly
4. Payments record correctly

**Check MongoDB:**
```bash
# Should show collections
# Users, Courses, Payments, etc.
```

---

## Security Checks

**Quick Verification:**

1. ✅ HTTPS enforced on all domains
2. ✅ JWT tokens in HTTP-only (check implementation)
3. ✅ CORS restricted to known origins
4. ✅ No secrets in frontend code
5. ✅ Rate limiting active

---

## Demo Script (For Client Presentation)

**Timeline:** 15-20 minutes

1. **Introduction (1 min)**
   - Show live site
   - "This is deployed and live"

2. **User Journey (5 min)**
   - Register new user
   - Verify email
   - Login
   - Browse courses

3. **Course Experience (5 min)**
   - View course details
   - Enroll in free course
   - Show lesson progress

4. **Payment Demo (5 min)**
   - Attempt paid course
   - Show checkout flow
   - Demo payment (test card)

5. **Admin Features (3 min)**
   - Login to admin panel
   - Show dashboard
   - User/course management

6. **Q&A (Remainder)**

---

## Emergency: If Tests Fail

### Frontend 404 Issues
- Check Vercel deployment completed
- Verify `_redirects` file exists
- Check browser console for errors

### Admin 404 Issues  
- **Critical!** Verify `vercel.json` in Admin directory
- Check Vercel build logs
- Ensure output directory is `dist`

### API Not Responding
- Check Render backend is running
- Verify MongoDB connection
- Check CORS settings

### Email Not Sending
- Verify Brevo API key
- Check FROM_EMAIL is valid sender
- Check spam folder

### Payment Issues
- Verify Paystack keys are valid
- Test with test card only
- Check callback URL

---

## Post-Testing Checklist

Before sending to client tonight:

- [ ] All 8 test flows completed successfully
- [ ] No console errors in frontend
- [ ] Admin panel accessible (no 404)
- [ ] Demo user account created for client
- [ ] Test payment card info saved
- [ ] Admin credentials ready
- [ ] Backup plan documented (rollback steps)
- [ ] Client has access to test accounts

---

## Success Criteria

✅ All tests pass  
✅ No 404 errors (especially admin!)  
✅ API responses < 1s  
✅ Emails sending correctly  
✅ Payments processing (or test mode working)  
✅ Admin panel fully functional  

**Ready for client demo! 🚀**

---

## Support During Demo

**Quick Commands:**

```bash
# Check all services
./verify-deployment.sh

# Run automated tests
node test-deployment.js

# Check logs (Backend)
cd Backend && npm start

# Re-deploy if needed
cd Frontend && vercel --prod
cd Admin && vercel --prod
```

**Emergency Contacts:**
- Deployment logs: Vercel/Render dashboards
- Database: MongoDB Atlas
- Emails: Brevo dashboard
- Monitoring: (if configured)

---

## Notes for Client Demo

**What to Show:**
1. Professional, polished UI
2. Smooth navigation (SPA)
3. Real payment integration
4. Working admin controls
5. Responsive design
6. Fast load times

**What to Avoid:**
- Test data in production
- Accidental real payments
- Deleting real data
- Sharing real credentials

**Have Ready:**
- Test user credentials
- Admin credentials
- Test payment card
- Demo script
- Rollback plan

---

**Created:** 2026-05-04  
**Status:** Ready for Testing  
**Next Update:** After client demo

