/********************************************
 *  QUICK DEPLOY GUIDE - What to Update
 ********************************************/

════════════════════════════════════════════
  RENDER (Backend) - What to Update
════════════════════════════════════════════

1. SERVICE SETTINGS
   ├─ Name: iodlearn-backend
   ├─ Region: Oregon (or your preference)
   ├─ Branch: main
   ├─ Root Directory: Backend/
   ├─ Build Command: (leave empty)
   └─ Start Command: node index.js

2. ENVIRONMENT VARIABLES (Critical!)
   
   ┌─────────────────────────────┬────────────────────────────┐
   │ Variable                    │ Value                      │
   ├─────────────────────────────┼────────────────────────────┤
   │ PORT                        │ 9000                       │
   │ NODE_ENV                    │ production                 │
   │ JWT_SECRET                  │ your-32-char-secret        │
   │ MONGODB_URI                 │ your-mongodb-connection    │
   │ CLIENT_URL                  │ https://your-frontend.vercel.app │
   │ CLIENT_BASE_URL             │ https://your-frontend.vercel.app │
   │ ADMIN_URL                   │ https://your-admin.vercel.app   │
   │ CLOUDINARY_CLOUD_NAME       │ your-cloud-name            │
   │ CLOUDINARY_API_KEY          │ your-api-key               │
   │ CLOUDINARY_API_SECRET       │ your-api-secret            │
   │ BREVO_API_KEY               │ your-brevo-key             │
   │ FROM_EMAIL                  │ your-email@gmail.com       │
   │ FROM_NAME                   │ Iodlearn                   │
   │ ADMIN_EMAIL                 │ admin@iodlearn.com         │
   │ PAYSTACK_SECRET_KEY         │ sk_test_...                │
   │ PAYSTACK_PUBLIC_KEY         │ pk_test_...                │
   │ VITE_APP_GOOGLE_CLIENT_ID   │ your-google-client-id      │
   │ GEMINI_API_KEY              │ your-gemini-key            │
   │ REDIS_URL                   │ redis://127.0.0.1:6379     │
   │ SENTRY_DSN                  │ your-sentry-dsn            │
   │ SENTRY_TRACES_SAMPLE_RATE   │ 0.05                       │
   │ SECURE_HEADERS              │ true                       │
   │ SAMESTITE_COOKIE            │ Lax                        │
   └─────────────────────────────┴────────────────────────────┘

════════════════════════════════════════════
  VERCEL (Frontend) - What to Update
════════════════════════════════════════════

1. PROJECT SETTINGS
   ├─ Framework: Vite
   ├─ Build Command: npm run build
   ├─ Output Directory: dist
   └─ Install Command: npm install

2. ENVIRONMENT VARIABLES
   
   ┌─────────────────────────────┬────────────────────────────┐
   │ Variable                    │ Value                      │
   ├─────────────────────────────┼────────────────────────────┤
   │ VITE_API_BASE_URL           │ https://your-backend.onrender.com/api │
   │ VITE_APP_GOOGLE_CLIENT_ID   │ your-google-client-id      │
   └─────────────────────────────┴────────────────────────────┘

════════════════════════════════════════════
  VERCEL (Admin) - What to Update
════════════════════════════════════════════

1. PROJECT SETTINGS
   ├─ Framework: Vite
   ├─ Build Command: npm run build
   ├─ Output Directory: dist
   └─ Install Command: npm install

2. ENVIRONMENT VARIABLES
   
   ┌─────────────────────────────┬────────────────────────────┐
   │ Variable                    │ Value                      │
   ├─────────────────────────────┼────────────────────────────┤
   │ VITE_API_BASE_URL           │ https://your-backend.onrender.com/api │
   └─────────────────────────────┴────────────────────────────┘

════════════════════════════════════════════
  IMPORTANT: URL Configuration
════════════════════════════════════════════

After deployment, make sure these match:

  Frontend URL:   https://your-frontend.vercel.app
  Admin URL:      https://your-admin.vercel.app
  Backend URL:    https://your-backend.onrender.com

Backend .env must have:
  CLIENT_URL=https://your-frontend.vercel.app
  ADMIN_URL=https://your-admin.vercel.app

If URLs don't match, API calls will fail!

════════════════════════════════════════════
  DEPLOYMENT ORDER
════════════════════════════════════════════

1. Deploy Backend to Render FIRST
   → Wait for "Healthy" status
   → Test: curl https://your-backend.onrender.com/api/courses

2. Deploy Frontend to Vercel
   → Point to live backend
   → Test in browser

3. Deploy Admin to Vercel
   → Point to live backend
   → Test admin login

════════════════════════════════════════════
  GENERATE SECRETS
════════════════════════════════════════════

JWT_SECRET (run in terminal):
  openssl rand -hex 32

Copy the output and use as JWT_SECRET in Render

════════════════════════════════════════════
  VERIFY DEPLOYMENT
════════════════════════════════════════════

Run after deploying:

  ./preflight-check.sh

Expected:
  ✅ All checks pass (10/10)
  ✅ No critical failures

════════════════════════════════════════════
  TROUBLESHOOTING
════════════════════════════════════════════

Problem: Frontend shows loading forever
Fix: Check VITE_API_BASE_URL on Vercel

Problem: Admin 404 error
Fix: Check vercel.json exists in Admin directory

Problem: API calls fail
Fix: Check CLIENT_URL in Backend .env matches Frontend URL

Problem: Database connection fails
Fix: MongoDB URI correct? IP whitelist configured?

════════════════════════════════════════════
  QUICK REFERENCE
════════════════════════════════════════════

Render Dashboard:    https://render.com/dashboard
Vercel Dashboard:    https://vercel.com/dashboard
MongoDB Atlas:       https://cloud.mongodb.com

Files to Check:
  Backend/.env (on Render)
  Frontend/.env (on Vercel)  
  Admin/.env (on Vercel)

Test Accounts:
  Student: demo.student+clientdemo@iodlearn.com / DemoStudent123!
  Admin:   admin@demo.com / admin123
  Mentor:  demo.mentor+clientdemo@iodlearn.com / DemoMentor123!

Test Card:
  4084084084084081 | 12/30 | 123 | 123456

════════════════════════════════════════════
  SUPPORT
════════════════════════════════════════════

Documentation:
  DEPLOYMENT.md - Full deployment guide
  CLIENT_DEMO_READY.md - Demo prep guide
  DEMO_DATA.md - Test data & accounts

Status: Ready to Deploy ✅

