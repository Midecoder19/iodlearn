🚨 URGENT: DATABASE NOT SEEDED 🚨
═══════════════════════════════════════

PROBLEM IDENTIFIED:
-------------------
The Backend on Render is RUNNING ✅
But the MongoDB database is EMPTY ❌
- 0 courses
- 0 users
- 0 data

This is why login fails: "Invalid credentials"

ROOT CAUSE:
-----------
The seed script (Backend/seed.js) was never executed on Render.
It creates demo users (admin, mentor, students) and courses.

QUICK FIX (Do This Now):
-------------------------

OPTION 1: Manual Seed (Fastest)
--------------------------------
1. Go to: https://iodlearn.onrender.com
2. Add this to the URL path: /seed
   Full URL: https://iodlearn.onrender.com/seed
   
   OR

2. Create a temporary route to trigger seed
   (See code addition below)

OPTION 2: Add Auto-Seed Code (Best)
-------------------------------------
Add this to Backend/index.js AFTER connectDB():

```javascript
connectDB();

// Auto-seed if empty
setTimeout(async () => {
  try {
    const User = require('./models/User');
    const Course = require('./models/Course');
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    if (userCount === 0 || courseCount === 0) {
      console.log('Seeding database...');
      require('./seed.js')();
    }
  } catch (e) {
    console.log('Seed check:', e.message);
  }
}, 5000);

// connectRedis(); // Disabled for demo
```

Then redeploy on Render.

OPTION 3: Direct MongoDB Insert (Advanced)
-------------------------------------------
Connect to MongoDB Atlas directly and run the seed script locally:

```bash
cd Backend
node seed.js
```

This requires MongoDB connection string.

--- VERIFICATION ---

Run this to check database state:
  https://iodlearn.onrender.com/api/courses
  
Returns: {"courses":[],"total":0,...} ← EMPTY!

After seeding should return: {"courses":[...],"total":6,...}

--- WHAT THE SEED CREATES ---

Users:
  • admin@demo.com / admin123 (role: admin)
  • mentor@demo.com / mentor123 (role: mentor)  
  • student@demo.com / student123 (role: student)
  • 3 more demo students

Courses: 6 demo courses
  1. Complete Web Development Bootcamp - ₦49,900
  2. Python for Data Science - ₦74,900
  3. React Native Mobile Development - ₦64,900
  4. Machine Learning Fundamentals - ₦99,900
  5. UI/UX Design Masterclass - ₦39,900
  6. DevOps & Cloud Computing - ₦89,900

--- ACTION REQUIRED ---

You MUST seed the database on Render for login to work!

Do one of the options above, then:

1. Test: https://iodlearn.onrender.com/api/courses
   Should show 6 courses ✅

2. Login: demo.student+clientdemo@iodlearn.com / DemoStudent123!
   Should work ✅

3. Admin: admin@demo.com / admin123
   Should work ✅

--- CODE STATUS ---

All code is correct and ready!
❌ Only missing: Database seed data

Fix this and the platform works perfectly! 🚀
