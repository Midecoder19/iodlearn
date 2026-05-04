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

## GitHub remote

This repository has been reset and pushed to `https://github.com/Midecoder19/iodlearn.git` with a fresh commit history.
