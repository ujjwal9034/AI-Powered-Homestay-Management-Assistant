/**
 * StayWise Backend — Express.js Server
 * AI-Powered Homestay Management Assistant API
 *
 * Multi-Role System: Customer, Owner, Admin
 * JWT Authentication, Google OAuth, Rate Limiting, RBAC
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const { initializePassport } = require('./config/passport');
const path = require('path');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const reviewRoutes = require('./routes/reviewRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const homestayRoutes = require('./routes/homestayRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Core Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(mongoSanitize()); // Sanitize user input to prevent NoSQL injection
app.use(requestLogger);

// ─── Rate Limiting ──────────────────────────────────────────────────────────────
// General API rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter rate limit for auth routes: 20 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// AI routes rate limit: 30 requests per 15 minutes (Gemini API is expensive)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI rate limit reached. Please wait before making more AI requests.' },
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Passport Initialization ────────────────────────────────────────────────────
initializePassport();
app.use(passport.initialize());

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reviews', generalLimiter, reviewRoutes);
app.use('/api/homestays', generalLimiter, homestayRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);
app.use('/api/bookings', generalLimiter, bookingRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/upload', generalLimiter, uploadRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// ─── Root Route ─────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to StayWise API — AI-Powered Homestay Management Assistant',
    version: '2.0 — Multi-Role System',
    roles: ['customer', 'owner', 'admin'],
    endpoints: {
      health: 'GET  /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      me: 'GET  /api/auth/me',
      googleOAuth: 'GET  /api/auth/google',
      homestays: 'GET  /api/homestays',
      homestayById: 'GET  /api/homestays/:id',
      myHomestays: 'GET  /api/homestays/mine',
      createHomestay: 'POST /api/homestays',
      reviews: 'GET  /api/reviews  (admin)',
      myReviews: 'GET  /api/reviews/mine  (customer)',
      homestayReviews: 'GET  /api/reviews/homestay/:id  (owner)',
      createReview: 'POST /api/reviews  (customer)',
      replyToReview: 'PATCH /api/reviews/:id/reply  (owner)',
      adminStats: 'GET  /api/admin/stats',
      adminUsers: 'GET  /api/admin/users',
    },
  });
});

// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global Error Handler (must be last) ────────────────────────────────────────
app.use(errorHandler);

// ─── Connect to MongoDB, then Start Server ──────────────────────────────────────
const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB
    await connectDB();

    // Step 2: Start Express server only after DB connection succeeds
    app.listen(PORT, () => {
      console.log(`🏠 StayWise API server running on http://localhost:${PORT}`);
      console.log(`📋 Health check:  http://localhost:${PORT}/api/health`);
      console.log(`🏡 Homestays API: http://localhost:${PORT}/api/homestays`);
      console.log(`⭐ Reviews API:   http://localhost:${PORT}/api/reviews`);
      console.log(`🔐 Auth API:      http://localhost:${PORT}/api/auth`);
      console.log(`👑 Admin API:     http://localhost:${PORT}/api/admin\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
