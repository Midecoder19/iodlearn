const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const initSentry = require("./config/sentry");
const { connectRedis, client: redisClient } = require("./config/redis");

const searchRoutes = require("./routes/searchRoutes");

dotenv.config();

// ✅ Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PAYSTACK_SECRET_KEY',
  'BREVO_API_KEY',
  'CLOUDINARY_CLOUD_NAME'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('\n❌ FATAL ERROR: Missing required environment variables:');
  missingEnvVars.forEach(v => console.error(`   - ${v}`));
  console.error('\n📝 Please set these in your .env file and restart.\n');
  process.exit(1);
}

// Sanitize production logs: avoid logging actual values.
if (process.env.NODE_ENV !== "production") {
    console.log("✅ Environment Variables Loaded: All required variables found");
}

connectDB();
// Redis connection - disabled for now, uncomment and configure for production
// connectRedis();

const app = express();

// Enhanced security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.paystack.co", "https://api.brevo.com"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: "deny" },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

app.use(express.json({ limit: "5mb" }));

// Rate limiting for different endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: "Too many payment attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress || "unknown",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many authentication attempts",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.use(generalLimiter);

// Diagnostic logging (without sensitive data)
app.use((req, res, next) => {
  const sanitizedUrl = req.url.split("?")[0];
  console.log(`📡 [${new Date().toISOString()}] ${req.method} ${sanitizedUrl}`);
  next();
});

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const clientBaseUrl = process.env.CLIENT_BASE_URL || clientUrl;
const adminUrl = process.env.ADMIN_URL || "http://localhost:5174";

// Allow both main frontend and admin panel
const allowedOrigins = [
  clientUrl, // Production frontend
  adminUrl, // Production admin
  "http://localhost:5173", // Main frontend dev
  "http://localhost:5174", // Admin panel dev
  "http://localhost:5175", // Admin panel alternative dev
  "http://localhost:5176", // Admin panel alternative dev
  "https://iodlearn.vercel.app", // Explicit production frontend
  "https://iodlearn-admin.vercel.app", // Explicit production admin
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS origin not allowed"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  maxAge: 86400
}));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ✅ API Routes
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
app.use("/api/auth", authLimiter, require("./routes/authRoutes2"));
app.use("/api/", require("./routes/pdfRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/search", searchRoutes);
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));

// New LMS Routes
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/payments", paymentLimiter, require("./routes/paymentRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));

// Socket.io setup
const server = http.createServer(app);
const { initializeSocket } = require("./config/socket");
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});
initializeSocket(io);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ✅ Centralized Error Handler Middleware (MUST be last)
app.use((err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isServerError = statusCode === 500;

  const errorResponse = {
    success: false,
    message: isServerError ? 'Server error' : err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV !== 'production' && !isServerError) {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);

  console.error(`\n❌ [ERROR] ${new Date().toISOString()}`);
  console.error(`   Route: ${req.method} ${req.path}`);
  console.error(`   Status: ${statusCode}`);
  console.error(`   Message: ${err.message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(`   Stack: ${err.stack.split('\n').slice(0, 3).join('\n')}`);
  }
});

const PORT = process.env.PORT || 9000;
console.log(`📡 Attempting to start server on port ${PORT}...`);
server.listen(PORT, () => {
  console.log(`🚀 Server successfully running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Database: ${process.env.MONGODB_URI ? '✅ Connected' : '❌ Not configured'}`);
});
