# Deployment Instructions for Render & Vercel

## Overview
This guide tells you exactly what to configure in Render (Backend) and Vercel (Frontend & Admin) for successful deployment.

---

## 🟢 RENDER (Backend API)

### What to Deploy
- **Directory:** `Backend/`
- **Service Type:** Web Service
- **Runtime:** Node.js

### Step-by-Step Setup

#### 1. Create New Web Service
1. Go to [Render Dashboard](https://render.com/dashboard)
2. Click **New** → **Web Service**
3. Connect your GitHub/GitLab repository
4. Select the repository containing this project

#### 2. Configure Service Settings

**Basic Settings:**
```
Name:           iodlearn-backend (or your preferred name)
Region:         Oregon (us-west-2) or your preferred region
Branch:         main (or your production branch)
Root Directory: Backend/
```

**Build Command:**
```
Leave empty (Node.js auto-detection will handle it)
```

**Start Command:**
```
node index.js
```

**Environment:**
```
Node:           18.x or 20.x (latest LTS)
Plan:           Free (start with free, upgrade as needed)
```

#### 3. Environment Variables (CRITICAL!)

Go to **Environment** tab and add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `9000` | Server port |
| `NODE_ENV` | `production` | Production mode |
| `JWT_SECRET` | *your-secret* | JWT signing key (min 32 chars) |
| `JWT_EXPIRES_IN` | `7d` | Token expiry |
| `MONGODB_URI` | *your-mongodb-uri* | MongoDB Atlas connection string |
| `CLIENT_URL` | `https://iodlearn.vercel.app` | Frontend URL |
| `CLIENT_BASE_URL` | `https://iodlearn.vercel.app` | Frontend base URL |
| `ADMIN_URL` | `https://iodlearn-admin.vercel.app` | Admin panel URL |
| `CLOUDINARY_CLOUD_NAME` | *your-cloud-name* | Cloudinary config |
| `CLOUDINARY_API_KEY` | *your-api-key* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | *your-api-secret* | Cloudinary secret |
| `BREVO_API_KEY` | *your-brevo-key* | Email service key |
| `FROM_EMAIL` | `ayomidebabarinde07@gmail.com` | Sender email |
| `FROM_NAME` | `Iodlearn` | Sender name |
| `ADMIN_EMAIL` | `admin@iodlearn.com` | Admin notifications |
| `PAYSTACK_SECRET_KEY` | *your-paystack-secret* | Payment gateway |
| `PAYSTACK_PUBLIC_KEY` | *your-paystack-public* | Payment public key |
| `VITE_APP_GOOGLE_CLIENT_ID` | *your-google-client-id* | Google OAuth (optional) |
| `GEMINI_API_KEY` | *your-gemini-key* | AI features (optional) |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis cache (optional) |
| `SENTRY_DSN` | *your-sentry-dsn* | Error tracking (optional) |
| `SENTRY_TRACES_SAMPLE_RATE` | `0.05` | Sentry sampling |
| `SECURE_HEADERS` | `true` | Security headers |
| `SAMESTITE_COOKIE` | `Lax` | Cookie policy |

**⚠️ Important:**
- Get actual values for all `*your-*` placeholders
- MongoDB URI: From MongoDB Atlas
- Cloudinary: From Cloudinary dashboard
- Brevo: From Brevo/Sendinblue (formerly)
- Paystack: From Paystack dashboard
- JWT_SECRET: Generate a strong secret (use: `openssl rand -hex 32`)

#### 4. Advanced Settings

**Auto-Deploy:**
- ✅ Auto-deploy from main branch (recommended)
- Or deploy manually after testing

**Health Check:**
```
Path: /api/health
Port: 9000
```

**Disk:**
- No disk needed (unless storing files locally)

#### 5. Deploy!

Click **Create Web Service**

Render will:
1. Install dependencies
2. Build the service
3. Start the server
4. Provide your live URL: `https://iodlearn-backend.onrender.com`

**Note:** Your actual URL will be different. Update `CLIENT_URL` and `ADMIN_URL` if needed.

---

## 🔵 VERCEL (Frontend)

### What to Deploy
- **Directory:** `Frontend/`
- **Framework:** Vite + React

### Step-by-Step Setup

#### 1. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your repository
4. Select Frontend directory (or repo if monorepo)

#### 2. Configure Framework Preset

**Framework Preset:**
```
Vite
```

Vercel should auto-detect this. If not:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Development Command: `npm run dev`

#### 3. Environment Variables

Go to **Environment Variables** tab:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://iodlearn.onrender.com/api` | Production, Preview, Development |
| `VITE_APP_GOOGLE_CLIENT_ID` | *your-google-client-id* | Production (optional) |

**⚠️ Important:**
- The `VITE_` prefix is REQUIRED for Vite to expose to browser
- Must match exactly what's in your `.env` file
- Without this, frontend can't talk to backend!

#### 4. Build & Output Settings

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

#### 5. Deploy!

Click **Deploy**

Vercel will:
1. Install dependencies
2. Run build
3. Deploy to CDN
4. Provide your URL: `https://iodlearn-frontend.vercel.app`

Your actual URL will be whatever you name the project.

**Important:** Update Backend `CLIENT_URL` to match this URL!

---

## 🟣 VERCEL (Admin Panel)

### What to Deploy
- **Directory:** `Admin/`
- **Framework:** Vite + React

### Step-by-Step Setup

#### 1. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your repository (or same repo as Frontend)
4. Select Admin directory

#### 2. Configure Framework Preset

**Framework Preset:**
```
Vite
```

**Build Command:**
```
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```
npm install
```

#### 3. Environment Variables

Go to **Environment Variables** tab:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://iodlearn.onrender.com/api` | Production, Preview, Development |

**⚠️ Critical:**
- This MUST match Frontend's API URL
- Without this, admin can't access backend!

#### 4. Deploy!

Click **Deploy**

Vercel will:
1. Install dependencies
2. Run build
3. Deploy to CDN
4. Provide your URL: `https://iodlearn-admin.vercel.app`

**Critical:** Update Backend `ADMIN_URL` to match this URL!

---

## 🔄 IMPORTANT: Cross-Service Configuration

### Update ALL URLs to Match Your Deployment

After deploying, you MUST update `.env` files with your actual URLs:

#### Backend `.env` (on Render)
```bash
# Update these to match your actual deployments:
CLIENT_URL=https://your-frontend-url.vercel.app
CLIENT_BASE_URL=https://your-frontend-url.vercel.app
ADMIN_URL=https://your-admin-url.vercel.app
```

#### Frontend `.env` (on Vercel)
```bash
# Should already be:
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

#### Admin `.env` (on Vercel)
```bash
# Should already be:
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

### Example with Real URLs

```
Your Frontend: https://iodlearn.vercel.app
Your Admin:    https://iodlearn-admin.vercel.app
Your Backend:  https://iodlearn-backend.onrender.com

Backend .env:
  CLIENT_URL=https://iodlearn.vercel.app
  CLIENT_BASE_URL=https://iodlearn.vercel.app
  ADMIN_URL=https://iodlearn-admin.vercel.app
```

---

## 📋 Pre-Deployment Checklist

### Before Deploying to Render:

- [ ] MongoDB Atlas cluster created and accessible
- [ ] MongoDB connection string copied
- [ ] Brevo (Sendinblue) account created
- [ ] Brevo API key generated
- [ ] Paystack test account created
- [ ] Paystack keys copied (test mode)
- [ ] Cloudinary account created (if using media upload)
- [ ] Strong JWT_SECRET generated (`openssl rand -hex 32`)
- [ ] All environment variables ready

### Before Deploying to Vercel (Frontend):

- [ ] Backend deployed and running
- [ ] Backend health check passing: `GET /api/health`
- [ ] Backend CORS allows your frontend URL
- [ ] API base URL configured
- [ ] Google OAuth configured (if using)

### Before Deploying to Vercel (Admin):

- [ ] Backend CORS allows admin URL
- [ ] Admin API URL configured
- [ ] Admin user exists in database
  - Create with: `node seed.js` or manually

---

## 🔧 Troubleshooting

### Frontend Shows "Loading..." Forever

**Check:**
1. Browser console for errors (F12)
2. Network tab for failed API calls
3. Is `VITE_API_BASE_URL` set correctly?
4. Does backend respond? `curl https://your-backend.onrender.com/api/health`

**Fix:**
```bash
# Update Frontend .env on Vercel
VITE_API_BASE_URL=https://your-actual-backend.onrender.com/api
```

### Admin Panel Shows 404

**Check:**
1. Vercel build succeeded?
2. `vercel.json` exists in Admin directory
3. Output directory is `dist`
4. Build command is `npm run build`

**Fix:**
- Redeploy Admin on Vercel
- Check build logs for errors

### API Calls Return 404 or CORS Error

**Check:**
1. Backend running? `curl https://your-backend.onrender.com/api/courses`
2. CORS configured for frontend URL?
3. Backend `.env` has correct `CLIENT_URL`?

**Fix:**
```bash
# Update Backend .env on Render
CLIENT_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
```

### Database Connection Fails

**Check:**
1. MongoDB URI correct?
2. IP whitelist allows Render IPs?
3. Database name correct?
4. Username/password correct?

**Fix:**
- Update MongoDB Atlas network access
- Add Render IPs to whitelist
- Or allow access from anywhere (0.0.0.0/0) for testing

### Emails Not Sending

**Check:**
1. Brevo API key valid?
2. FROM_EMAIL is verified in Brevo?
3. Check spam folder?

**Fix:**
- Verify Brevo account
- Add sender email to Brevo
- Check Brevo sending limits

### Payment Not Working

**Check:**
1. Paystack keys correct?
2. Test mode enabled?
3. Callback URL configured?

**Fix:**
```bash
# Update Backend .env
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

---

## 🚀 Deployment Workflow

### Recommended Order:

1. **Deploy Backend first** (Render)
   - Wait for it to be healthy
   - Test: `curl https://your-backend.onrender.com/api/courses`

2. **Deploy Frontend** (Vercel)
   - Point to live backend
   - Test in browser

3. **Deploy Admin** (Vercel)
   - Point to live backend
   - Test admin login

4. **Update all URLs** in `.env` files
   - Make sure they match actual deployments

5. **Redeploy all services** if URLs changed

---

## 📊 Quick Verification

After deploying, run these checks:

```bash
# Check Backend
curl https://iodlearn-backend.onrender.com/api/health
# Expected: {"status":"OK","timestamp":"..."}

# Check Frontend
curl -I https://iodlearn.vercel.app
# Expected: HTTP/2 200

# Check Admin  
curl -I https://iodlearn-admin.vercel.app
# Expected: HTTP/2 200

# Check API
curl https://iodlearn-backend.onrender.com/api/courses
# Expected: {"courses":[...],"total":...}
```

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is strong and secret
- [ ] MongoDB not exposed to internet
- [ ] Brevo API key has limited permissions
- [ ] Paystack test keys in production? (switch to live before launch)
- [ ] CORS only allows your domains
- [ ] Rate limiting enabled
- [ ] HTTPS enforced everywhere
- [ ] No secrets in code/repository

---

## 📞 Support

**Render Status:** https://status.render.com  
**Vercel Status:** https://vercel.com/status  
**Vercel Help:** https://vercel.com/docs  
**Render Help:** https://render.com/docs  

---

## ✅ Final Checklist Before Going Live

- [ ] All services deployed
- [ ] All URLs updated and matching
- [ ] Health checks passing
- [ ] Test user can register
- [ ] Test user can login
- [ ] Test user can view courses
- [ ] Payment flow works (test mode)
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Load time acceptable (< 3s)
- [ ] Security checks complete
- [ ] Backup plan ready

---

**Status:** Ready for Deployment  
**Estimated Time:** 30-60 minutes  
**Difficulty:** Medium

---

## Links

- [Render Dashboard](https://render.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Brevo Dashboard](https://app.brevo.com)
- [Paystack Dashboard](https://dashboard.paystack.com)
- [Cloudinary Dashboard](https://cloudinary.com/console)

---

**Last Updated:** 2026-05-04  
**Version:** 1.0

