# Iodlearn LMS (MERN)

A full-stack learning management platform built with React, Node.js, Express, MongoDB, and Redis. This repository contains a frontend app, an admin panel, and a backend API.

## Repository structure

- `Backend/` - Node.js/Express API server, database models, auth, payments, PDF generation, and email delivery.
- `Frontend/` - React + Vite main user-facing web app.
- `Admin/` - React + Vite admin dashboard for content, course, and user management.
- `query` - miscellaneous project artifact.

## Key features

- Email-based registration and OTP verification
- JWT authentication
- Redis-backed login lockout
- Cloudinary support for file uploads
- Newsletter and payment integration
- Search, course, progress tracking, and admin management endpoints

## Requirements

- Node.js 18+ recommended
- npm
- MongoDB database
- Redis (optional but recommended for login lockout caching)
- Brevo API key for email delivery
- Cloudinary account for uploads

## Environment variables

Create a `.env` file in `Backend/` and set values for:

```env
MONGODB_URI=
JWT_SECRET=
PAYSTACK_SECRET_KEY=
BREVO_API_KEY=
CLOUDINARY_CLOUD_NAME=
FROM_EMAIL=
FROM_NAME=
REDIS_URL=
CLIENT_URL=
CLIENT_BASE_URL=
VITE_APP_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_ID=
NODE_ENV=development
PORT=9000
```

> Note: `FROM_EMAIL` and `FROM_NAME` are optional. If not provided, defaults are used.

## Setup

### Backend

```bash
cd Backend
npm install
```

### Frontend

```bash
cd Frontend
npm install
```

### Admin panel

```bash
cd Admin
npm install
```

## Run locally

### Backend

```bash
cd Backend
npm run dev
```

### Frontend

```bash
cd Frontend
npm run dev
```

### Admin panel

```bash
cd Admin
npm run dev
```

## Build for production

### Frontend

```bash
cd Frontend
npm run build
```

### Admin panel

```bash
cd Admin
npm run build
```

### Backend

The backend is ready to run with `node index.js` once the environment variables are configured.

## Deployment notes

- Ensure the backend service can access `MONGODB_URI`, `JWT_SECRET`, `BREVO_API_KEY`, and `CLOUDINARY_CLOUD_NAME`.
- Configure Redis if using `REDIS_URL` for cache-based login locking.
- Set `CLIENT_URL` and/or `CLIENT_BASE_URL` to your deployed frontend URL(s).
- Protect any production credentials and do not commit `.env` files.

## Vercel + Railway deployment

This project is a monorepo with separate apps:

- `Backend/` → backend API
- `Frontend/` → main user-facing web app
- `Admin/` → admin dashboard

### Deploy backend to Railway or Render

This repo includes a `render.yaml` file for Render deployment.

For Render, the backend service is configured to use the `Backend` subfolder as the service root.

#### Backend service settings for Render

- Root directory: `Backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Health check path: `/health`

### Deploy backend to Railway

1. Create a new Railway project.
2. Connect your GitHub repo or deploy from the local repository.
3. Set the root directory to `Backend`.
4. Use `npm install` and `npm start` or `npm run dev` for development.
5. Add Railway environment variables matching `Backend/.env.example` and the root README.
6. Copy the Railway service URL (for example: `https://my-backend.up.railway.app`).

Required backend env vars:

- `MONGODB_URI`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY`
- `BREVO_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FROM_EMAIL`
- `FROM_NAME`
- `REDIS_URL`
- `CLIENT_URL`
- `CLIENT_BASE_URL`
- `VITE_APP_GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_ID`

### Deploy frontend to Vercel

1. Create a new Vercel project.
2. Select this GitHub repo.
3. Set the root directory to `Frontend`.
4. Set the build command to `npm run build`.
5. Set the output directory to `dist`.
6. Set environment variable:

   - `VITE_API_BASE_URL` = your Railway backend URL + `/api`

   Example:

   ```text
   VITE_API_BASE_URL=https://my-backend.up.railway.app/api
   ```

### Deploy admin panel to Vercel (optional)

If you want the admin panel hosted separately:

1. Create another Vercel project.
2. Set the root directory to `Admin`.
3. Use build command `npm run build` and output directory `dist`.
4. Set the same env var:

   - `VITE_API_BASE_URL=https://my-backend.up.railway.app/api`

### Notes

- The frontend uses `VITE_API_BASE_URL` to call the backend API.
- `Frontend` and `Admin` are separate deploys if both should be live.
- If your backend is only used by the frontend app, `CLIENT_URL` can be the Vercel frontend URL.

## GitHub remote

This repository has been reset and pushed to `https://github.com/Midecoder19/iodlearn.git` with a fresh commit history.
