# Troubleshooting Guide - Iodlearn Deployment

## Current Status Check

Run these commands to verify everything is deployed correctly:

### 1. Check Frontend API URL
```bash
curl -s https://iodlearn.vercel.app/assets/index-*.js 2>/dev/null | grep -o "iodlearn.onrender.com/api" | head -1
# Should output: iodlearn.onrender.com/api
```

### 2. Check Admin API URL  
```bash
curl -s https://iodlearn-admin.vercel.app/assets/index-*.js 2>/dev/null | grep -o "iodlearn.onrender.com/api" | head -1
# Should output: iodlearn.onrender.com/api
```

### 3. Check Backend API
```bash
curl -s -X POST https://iodlearn.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test'$(date +%s)'@ex.com","password":"Test123456!"}'
# Should output: {"message":"Registration successful..."}
```

### 4. Run All Checks
```bash
./preflight-check.sh
# Should show: Passed: 10, Failed: 0
```

---

## Common Issues & Solutions

### Issue: Registration shows 404

**Symptom:** `POST https://iodlearn.onrender.com/api/api/auth/register 404`

**Cause:** Double `/api/api/` in URL

**Solution:**
1. Check if deployed version has correct URL
2. Hard refresh browser (Ctrl+Shift+R)
3. If still failing, force rebuild on Vercel

**Check:**
```bash
# In browser DevTools Network tab
# Look for the request
# Correct: /api/auth/register
# Wrong: /api/api/auth/register
```

---

### Issue: Shows localhost:9000 in requests

**Symptom:** Request to `localhost:9000/api/auth/register`

**Cause:** Old build with localhost URL

**Solution:**
1. Rebuild Frontend: `cd Frontend && npm run build`
2. Redeploy to Vercel: `vercel --prod`
3. Hard refresh browser

**Check:**
```bash
# Should NOT find localhost
grep -r "localhost:9000" Frontend/dist/ 2>/dev/null
# Should output nothing
```

---

### Issue: CORS error

**Symptom:** "Access-Control-Allow-Origin" error in console

**Cause:** Backend not configured for frontend origin

**Solution:**
1. Check Backend .env on Render
2. Ensure `CLIENT_URL` matches frontend URL exactly
3. Redeploy backend if changed

**Check:**
```bash
# Should show correct origin
curl -sI https://iodlearn.onrender.com/api/courses | grep -i access-control
```

---

### Issue: Page loads but API calls fail

**Symptom:** Page loads, but buttons don't work, console shows API errors

**Causes:**
1. Backend down
2. Wrong API URL in frontend
3. Network issues

**Solutions:**

1. Check backend is running:
```bash
curl https://iodlearn.onrender.com/api/courses
# Should return JSON with courses
```

2. Check frontend API URL:
```bash
# In browser DevTools
# Application → Local Storage → https://iodlearn.vercel.app
# Check VITE_API_BASE_URL
```

3. Check network:
```bash
# Should get response
curl -I https://iodlearn.onrender.com/api/health
```

---

### Issue: Admin panel shows 404

**Symptom:** `https://iodlearn-admin.vercel.app` shows 404

**Causes:**
1. Vercel build failed
2. Wrong framework detected
3. Missing vercel.json

**Solutions:**

1. Check Vercel dashboard:
   - Build status should be "Ready"
   - Not "Failed" or "Building"

2. Check vercel.json exists:
```bash
ls Admin/vercel.json
# Should exist
```

3. Force rebuild:
```bash
cd Admin
vercel --prod
```

---

### Issue: Login fails with verified account

**Symptom:** "Please verify your email first" for verified account

**Cause:** Database issue or verification token expired

**Solutions:**

1. Re-verify account:
   - Request new OTP
   - Use latest code

2. Check database:
```bash
# In mongo shell
use iodlearn
db.users.find({email: "your-email"})
# Check verified field
```

3. Reset verification:
```bash
# Update user to verified
db.users.updateOne(
  {email: "your-email"},
  {$set: {verified: true}}
)
```

---

### Issue: Payment not working

**Symptom:** Paystack not loading or payment fails

**Causes:**
1. Wrong Paystack keys
2. Test keys in production
3. Callback URL wrong

**Solutions:**

1. Check keys in Backend .env:
```bash
# Should be test keys for testing
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
```

2. Use test card:
   - Card: 4084084084084081
   - Expiry: Any future date
   - CVV: 123
   - OTP: 123456

3. Check callback URL:
```bash
# In Backend .env
CLIENT_BASE_URL should match frontend
```

---

### Issue: Email not received

**Symptom:** Registration email not received

**Causes:**
1. Brevo API key invalid
2. Email in spam
3. FROM_EMAIL not verified

**Solutions:**

1. Check Brevo dashboard:
   - API key valid
   - Sender email verified

2. Check spam folder

3. Check logs:
```bash
# In Render logs
# Look for email send errors
```

4. Test email manually:
```bash
# Check Brevo dashboard → Email Test
```

---

## Deployment Verification

### Step 1: Check Deployments

**Vercel Frontend:**
1. Go to https://vercel.com/dashboard
2. Select frontend project
3. Check latest deployment:
   - Status: Ready ✅
   - Framework: Vite ✅

**Vercel Admin:**
1. Go to https://vercel.com/dashboard
2. Select admin project
3. Check latest deployment:
   - Status: Ready ✅
   - Framework: Vite ✅

**Render Backend:**
1. Go to https://render.com/dashboard
2. Select backend service
3. Check status:
   - Status: Running ✅
   - Health: Passed ✅

---

### Step 2: Check URLs

**All URLs should use HTTPS:**
- Frontend: `https://iodlearn.vercel.app`
- Admin: `https://iodlearn-admin.vercel.app`
- Backend: `https://iodlearn.onrender.com`

**No localhost in production!**

---

### Step 3: Check Environment Variables

**Backend (.env on Render):**
```
CLIENT_URL=https://iodlearn.vercel.app
ADMIN_URL=https://iodlearn-admin.vercel.app
```

**Frontend (.env on Vercel):**
```
VITE_API_BASE_URL=https://iodlearn.onrender.com/api
```

**Admin (.env on Vercel):**
```
VITE_API_BASE_URL=https://iodlearn.onrender.com/api
```

---

### Step 4: Test Manually

**1. Open Frontend:**
- https://iodlearn.vercel.app
- Should load without errors
- No 404 in console

**2. Open Admin:**
- https://iodlearn-admin.vercel.app
- Should load login page
- No 404 error (THIS WAS THE ISSUE!)

**3. Test API:**
```bash
curl https://iodlearn.onrender.com/api/courses
# Should return courses
```

**4. Test Registration:**
1. Go to /register
2. Fill form
3. Submit
4. Check email
5. Should see success message

---

## Browser Checks

### Clear Cache

**Chrome/Edge:**
1. DevTools (F12)
2. Application tab
3. Clear storage
4. Clear site data

**Firefox:**
1. DevTools (F12)
2. Storage tab
3. Clear all

### Hard Refresh

**Windows:** Ctrl + Shift + R  
**Mac:** Cmd + Shift + R

### Incognito Mode

Test in incognito to avoid:
- Extensions blocking requests
- Cache serving old files
- Cookies causing issues

---

## Network Troubleshooting

### Check Request URL

1. Open DevTools (F12)
2. Network tab
3. Perform action (register, login, etc.)
4. Check request:
   - URL: Should be correct
   - Status: Should be 200/201
   - Type: Should be XHR/fetch

### Check Request Headers

**Should have:**
```
Content-Type: application/json
Origin: https://iodlearn.vercel.app
```

### Check Response Headers

**Should have:**
```
access-control-allow-origin: https://iodlearn.vercel.app
content-type: application/json
```

### Check Response Body

**Success:**
```json
{"message": "Success!"}
```

**Error:**
```json
{"message": "Error description"}
```

---

## Logs to Check

### Vercel Build Logs

1. Go to Vercel dashboard
2. Select project
3. Check deployment
4. View build logs

**Look for:**
- ✅ Build succeeded
- ❌ Build failed
- ⚠️ Warnings (usually OK)

### Render Logs

1. Go to Render dashboard
2. Select service
3. Check logs

**Look for:**
- ✅ Server started
- ✅ Database connected
- ❌ Connection errors
- ❌ Missing environment variables

### Browser Console

1. Open DevTools (F12)
2. Console tab

**Look for:**
- ✅ No red errors
- ❌ JavaScript errors
- ❌ Failed resource loading

---

## Quick Fix Checklist

### If Registration Fails:

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check Network tab for correct URL
- [ ] Verify Backend is running
- [ ] Check CORS headers
- [ ] Test API with curl

### If Admin 404:

- [ ] Check Vercel deployment status
- [ ] Verify vercel.json exists
- [ ] Force rebuild on Vercel
- [ ] Check URL is correct

### If Login Fails:

- [ ] Verify account is verified
- [ ] Check email verification
- [ ] Reset password if needed
- [ ] Check database connection

### If Payments Fail:

- [ ] Check Paystack keys
- [ ] Use test card
- [ ] Verify callback URL
- [ ] Check network tab

---

## Still Having Issues?

**Provide This Information:**

1. What URL are you on?
2. What did you do?
3. What error did you see? (screenshot)
4. What's in Network tab? (screenshot)
5. What's in Console tab? (screenshot)
6. When did you deploy?
7. Did you change any .env files?

**This helps diagnose the exact issue!**

---

## Emergency Reset

### Redeploy Everything:

```bash
# Frontend
cd Frontend
npm run build
vercel --prod

# Admin  
cd ../Admin
npm run build
vercel --prod

# Backend (on Render)
# Redeploy from dashboard
```

### Clear All Data:

```bash
# Clear browser data
localStorage.clear()
sessionStorage.clear()

# Clear cookies for site

# Hard refresh
Ctrl+Shift+R
```

---

## Support Resources

- **Vercel Status:** https://status.vercel.com
- **Render Status:** https://status.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Documentation:** See DEPLOYMENT.md

---

## Last Resort

If nothing works:

1. Clone fresh copy
2. Set up .env files
3. Deploy from scratch
4. Test each step

But this should fix 99% of issues! 🚀

