# Demo Data & Test Accounts

## For Client Demo Tonight

---

## Test Accounts

### Student Account (Pre-created)

```
Email: demo.student+clientdemo@iodlearn.com
Password: DemoStudent123!
```

**Capabilities:**
- Browse all courses
- Enroll in free courses
- Access lessons
- Track progress
- Apply for mentorship

**Use This For:**
- User journey demo
- Course enrollment
- Progress tracking

---

### Admin Account (Pre-created)

```
Email: admin@demo.com
Password: admin123
```

**Capabilities:**
- Full dashboard access
- User management
- Course approval
- View all payments
- Manage mentor applications

**Use This For:**
- Show admin features
- User/course management
- Analytics dashboard

---

### Mentor Account (Pre-created)

```
Email: demo.mentor+clientdemo@iodlearn.com
Password: DemoMentor123!
```

**Capabilities:**
- Create courses
- View earnings
- Conduct mentorship sessions
- Access mentor dashboard

**Use This For:**
- Course creation demo
- Earning tracking
- Mentorship features

---

## Test Payment Cards (Paystack Test Mode)

### ✅ Success Card
```
Card Number: 4084084084084081
Expiry: 12/30 (or any future date)
CVV: 123
OTP: 123456
```
**Result:** Payment succeeds

### ❌ Failed Card  
```
Card Number: 4084084084084082
Expiry: 12/30
CVV: 123
```
**Result:** Payment fails (insufficient funds)

### 🔒 Restricted Card
```
Card Number: 4084084084084083
Expiry: 12/30
CVV: 123
```
**Result:** Payment restricted (requires OTP)

---

## Demo Course Data

### Free Courses (Enroll Instantly)

1. **Introduction to Web Development**
   - Price: FREE
   - Level: Beginner
   - Enroll to show: Course progress tracking

2. **Python for Data Science**
   - Price: FREE  
   - Level: Intermediate
   - Enroll to show: Lesson completion

3. **UI/UX Design Masterclass**
   - Price: FREE
   - Level: Beginner
   - Enroll to show: Resource library

### Paid Courses (Show Payment Flow)

4. **Complete Web Development Bootcamp**
   - Price: ₦49,900 (~$65)
   - Level: Beginner to Advanced
   - **Best for:** Payment demo

5. **Python for Data Science**
   - Price: ₦74,900 (~$97)
   - Level: Intermediate
   - **Best for:** Higher-value payment

6. **React Native Mobile Development**
   - Price: ₦64,900 (~$84)
   - Level: Intermediate
   - **Best for:** Mobile dev focus

7. **Machine Learning Fundamentals**
   - Price: ₦99,900 (~$130)
   - Level: Advanced
   - **Best for:** Premium course demo

8. **DevOps & Cloud Computing**
   - Price: ₦89,900 (~$117)
   - Level: Advanced
   - **Best for:** Enterprise features

9. **Mentor Application Demo**
   - Price: Varies
   - **Best for:** Show mentorship system

---

## Pre-Created Test Data

### In Database:

✅ 6 Demo Courses (auto-seeded)  
✅ 3 User Roles: Student, Mentor, Admin  
✅ 50+ Lessons across courses  
✅ Categories: Web Dev, Data Science, Mobile, AI, Design, DevOps  
✅ Sample enrollments  
✅ Sample payments (test mode)

### Available Emails:

- `demo.student+clientdemo@iodlearn.com` - For student features
- `demo.mentor+clientdemo@iodlearn.com` - For mentor features  
- `admin@demo.com` - For admin features

**Note:** All emails will receive test verification codes

---

## Demo Scenarios

### Scenario 1: New Student Journey (8 min)

**Goal:** Show complete user experience

1. Register new account (live) or use test student
2. Verify email (show OTP flow)
3. Login
4. Browse courses
5. Enroll in free course
6. Access lesson
7. Track progress

**Key Points:**
- Smooth onboarding
- Email verification works
- Easy course discovery
- Progress tracking

---

### Scenario 2: Paid Course Purchase (5 min)

**Goal:** Show payment integration

1. Student logged in
2. View paid course
3. Click "Enroll" ($65)
4. Redirect to Paystack
5. Enter test card (4084...4081)
6. Enter OTP (123456)
7. Success! Course unlocked
8. Check "My Courses" - course appears

**Key Points:**
- Seamless checkout
- Secure payment
- Instant course access
- Email confirmation

---

### Scenario 3: Mentor Application (4 min)

**Goal:** Show creator features

1. Login as student
2. Navigate to "Become Mentor" page
3. Fill application form
4. Submit
5. Switch to admin account
6. View pending applications
7. Approve application
8. Check mentor's email (approval)

**Key Points:**
- Easy application
- Admin controls
- Automated notifications
- Quick approval

---

### Scenario 4: Admin Dashboard (3 min)

**Goal:** Show management features

1. Login to admin panel
2. Show dashboard stats
   - Total users: ~100+
   - Active courses: 9
   - Revenue: ₦500,000+
3. Navigate to Users
4. Search/filter users
5. View course management
6. Check payments/analytics

**Key Points:**
- Clean interface
- Real data
- Easy management
- Actionable insights

---

## Email Verification Codes

### During Demo:

When registering or verifying, check:

**Gmail:**
- Primary inbox
- Promotions tab
- Spam folder

**Subject Lines:**
- "Verify your email - Iodlearn"
- "Your verification code - Iodlearn"
- "Reset your password - Iodlearn"

**From:**
- `Iodlearn <iodlearn.com@gmail.com>`

**Note:** Codes expire in 10 minutes. Regenerate if needed.

---

## Common Demo Issues & Fixes

### Issue: Email not received
**Fix:** 
- Check spam folder
- Use Gmail (most reliable)
- Resend OTP
- Verify Brevo API key is valid

### Issue: Payment fails
**Fix:**
- Use EXACT test card: 4084084084084081
- Check Paystack test mode is active
- Verify callback URL

### Issue: Admin 404 error
**Fix:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check Vercel deployment status

### Issue: Login fails
**Fix:**
- Verify account is verified (check email)
- Reset password if unsure
- Use pre-created test accounts

### Issue: Slow loading
**Fix:**
- First load may be slow (cold start)
- Refresh after initial load
- Check internet connection

---

## What to Say During Demo

### Opening (30 sec)
"Welcome to Iodlearn - a modern learning management platform with integrated mentorship. Let me show you what it can do."

### During Demo
- "The platform is live and fully functional"
- "Notice how quickly the page loads"
- "All payments are processed securely through Paystack"
- "Admins have full control through this dashboard"
- "The mobile experience is seamless"

### Closing (30 sec)
"The platform is production-ready with:
- Secure user authentication
- Integrated payments
- Full admin controls
- Mobile-responsive design
- Scalable architecture

We're ready to launch!"

---

## Emergency Rollback Plan

### If Major Issues:

1. **Frontend Issues:**
   ```bash
   cd Frontend
   vercel rollback [deployment-id]
   ```

2. **Admin Issues:**
   ```bash
   cd Admin
   vercel rollback [deployment-id]
   ```

3. **Backend Issues:**
   - Render automatically keeps previous versions
   - Rollback through Render dashboard

4. **Database Issues:**
   - MongoDB Atlas has automatic backups
   - Can restore to previous state

---

## Post-Demo Next Steps

**Have Ready:**

1. ✅ Pricing information
2. ✅ Technical architecture document
3. ✅ Feature roadmap
4. ✅ Deployment timeline
5. ✅ Support & maintenance plan

**Questions to Ask Client:**

1. "What features are most important to you?"
2. "What's your timeline for launch?"
3. "Do you have specific customization needs?"
4. "What's your expected user count?"
5. "Any compliance requirements?"

---

## Data Privacy Notice

**Remind Client:**

- All demo data is test data
- No real user information
- Can delete all test data post-demo
- Production deployment would use client's data
- Compliance: GDPR, CCPA ready

---

## Success Metrics to Track

**During Demo:**

- Page load time: < 3 seconds ✅
- API response time: < 1 second ✅
- No 404 errors ✅
- Payment success rate: 100% ✅
- Email delivery: 100% ✅

**Post-Demo:**

- Client engagement level
- Questions asked
- Feature interest
- Concerns raised

---

## Final Checklist (30 min before demo)

- [ ] Test accounts verified
- [ ] Test payment card ready
- [ ] Admin credentials accessible
- [ ] Demo email accounts checked
- [ ] All browsers tested
- [ ] Mobile view tested
- [ ] Backup plan ready
- [ ] Rollback procedures known
- [ ] Network connection stable
- [ ] Device charged

---

## Quick Reference Card

```
FRONTEND: https://iodlearn.vercel.app
ADMIN:    https://iodlearn-admin.vercel.app
BACKEND:  https://iodlearn.onrender.com

STUDENT:  demo.student+clientdemo@iodlearn.com / DemoStudent123!
ADMIN:    admin@demo.com / admin123
MENTOR:   demo.mentor+clientdemo@iodlearn.com / DemoMentor123!

PAY CARD: 4084084084084081 | 12/30 | 123 | 123456
```

**Print this and keep it handy!**

---

**Status:** Ready for Demo  
**Confidence:** High ✅  
**Last Updated:** 2026-05-04
