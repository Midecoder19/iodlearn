# Deployment Configuration for Iodlearn

## Overview
This document provides step-by-step instructions for deploying the Iodlearn platform (Frontend, Admin, and Backend) to production environments.

## Frontend Deployment (Vercel)

### Configuration
- **Framework:** Vite + React
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Entry Point:** `src/main.jsx`

### Environment Variables
Add the following to Vercel environment variables:
```
VITE_API_BASE_URL=https://iodlearn.onrender.com/api
```

### Vercel Configuration
The `vercel.json` file in the Frontend directory handles:
- SPA routing (all routes redirect to index.html)
- Build settings
- Framework detection

### Deploy Steps
1. Import the Frontend directory to Vercel
2. Configure environment variables
3. Deploy
4. Expected URL: `https://iodlearn.vercel.app`

## Admin Panel Deployment (Vercel)

### Configuration
- **Framework:** Vite + React
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Entry Point:** `src/main.jsx`

### Environment Variables
Add the following to Vercel environment variables:
```
VITE_API_BASE_URL=https://iodlearn.onrender.com/api
```

### Vercel Configuration
The `vercel.json` file in the Admin directory includes:
- SPA routing with fallback to index.html
- Build and dev commands
- Environment variable placeholders

### Deploy Steps
1. Import the Admin directory to Vercel
2. Configure environment variables (VITE_API_BASE_URL)
3. Deploy
4. Expected URL: `https://iodlearn-admin.vercel.app`

## Backend Deployment (Render)

### Configuration
- **Framework:** Node.js + Express
- **Build Command:** N/A
- **Start Command:** `node index.js`
- **Port:** 9000 (configurable via PORT env var)

### Environment Variables
Required for Backend (.env):
```
PORT=9000
NODE_ENV=production
JWT_SECRET=<your-jwt-secret>
MONGODB_URI=<your-mongodb-connection-string>
PAYSTACK_SECRET_KEY=<your-paystack-secret>
BREVO_API_KEY=<your-brevo-api-key>
FROM_EMAIL=<your-from-email>
FROM_NAME=Iodlearn
ADMIN_EMAIL=admin@iodlearn.com
CLIENT_URL=https://iodlearn.vercel.app
CLIENT_BASE_URL=https://iodlearn.vercel.app
ADMIN_URL=https://iodlearn-admin.vercel.app
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
VITE_APP_GOOGLE_CLIENT_ID=<your-google-client-id>
REDIS_URL=redis://127.0.0.1:6379
```

### Deploy Steps
1. Deploy to Render (or other Node.js hosting)
2. Configure all environment variables
3. Set start command to `node index.js`
4. Expected URL: `https://iodlearn.onrender.com`

## CORS Configuration

The Backend (`index.js`) is configured with the following allowed origins:
- `https://iodlearn.vercel.app` - Production Frontend
- `https://iodlearn-admin.vercel.app` - Production Admin
- `http://localhost:5173` - Frontend Dev
- `http://localhost:5174` - Admin Dev
- `http://localhost:5175` - Admin Alternative Dev
- `http://localhost:5176` - Admin Alternative Dev

### Adding New Origins
To add new origins, update the `allowedOrigins` array in `Backend/index.js`.

## Troubleshooting

### Admin Panel 404 Error
**Issue:** Admin panel returns 404 on refresh or direct URL access
**Solution:** 
1. Ensure `vercel.json` is present in the Admin directory
2. Ensure `_redirects` file exists with content: `/* /index.html 200`
3. Verify Vercel framework detection is set to "Vite"
4. Check that output directory is set to "dist"

### API Connection Issues
**Issue:** Frontend/Admin cannot connect to Backend
**Solution:**
1. Verify `VITE_API_BASE_URL` environment variable is set correctly
2. Check CORS settings in `Backend/index.js`
3. Ensure Backend is running and accessible
4. Check network console for CORS errors

### Build Failures
**Issue:** Build fails on Vercel/Render
**Solution:**
1. Verify all dependencies are in package.json
2. Check Node.js version compatibility
3. Ensure build command matches package.json scripts
4. Review build logs for specific errors

## Production Checklist

- [ ] All environment variables configured
- [ ] CORS origins updated for production URLs
- [ ] Database connection string configured
- [ ] Payment gateway keys configured
- [ ] Email service API keys configured
- [ ] Cloudinary credentials configured
- [ ] JWT_SECRET is strong and secure
- [ ] SSL/TLS is enabled
- [ ] Rate limiting is active
- [ ] Security headers are configured
- [ ] MongoDB connection is using TLS/SSL
- [ ] Redis connection is configured (if used)
- [ ] Error tracking (Sentry) is configured
- [ ] Monitoring and logging are active
- [ ] Backup strategy is in place
- [ ] Domain names point to correct services

## Security Best Practices

1. **Never commit .env files** to version control
2. Use strong, unique secrets for JWT, database, and API keys
3. Enable HTTPS for all services
4. Implement rate limiting on all API endpoints
5. Use parameterized queries to prevent SQL injection
6. Validate and sanitize all user inputs
7. Implement proper authentication and authorization
8. Use Content Security Policy (CSP) headers
9. Regularly update dependencies
10. Monitor for security vulnerabilities

## Support

For deployment issues or questions, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Vite Documentation](https://vitejs.dev/guide)
