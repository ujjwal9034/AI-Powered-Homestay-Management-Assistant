/**
 * StayWise Backend — Express.js Server
 * AI-Powered Homestay Management Assistant API
 *
 * Week 5: MongoDB Atlas + JWT Authentication
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const reviewRoutes = require('./routes/reviewRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Core Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ─── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/health', healthRoutes);

// ─── Root Route ─────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to StayWise API — AI-Powered Homestay Management Assistant',
    endpoints: {
      health: 'GET  /api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET  /api/auth/me',
      reviews: 'GET  /api/reviews',
      reviewById: 'GET  /api/reviews/:id',
      createReview: 'POST /api/reviews',
      updateReview: 'PUT  /api/reviews/:id',
      patchReview: 'PATCH /api/reviews/:id',
      deleteReview: 'DELETE /api/reviews/:id',
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
      console.log(`⭐ Reviews API:   http://localhost:${PORT}/api/reviews`);
      console.log(`🔐 Auth API:      http://localhost:${PORT}/api/auth\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
