/**
 * AI Routes
 * Endpoints for AI-powered features (Trip Planner, etc.)
 *
 * All routes are protected (require authentication) and rate-limited
 * to prevent Gemini API abuse.
 */

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const { planTrip } = require('../controllers/aiController');

// Rate limiter for AI endpoints — 5 requests per 15-minute window per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests from this IP. Please try again after 15 minutes.',
  },
});

// POST /api/ai/trip-planner — Generate personalized travel itinerary
router.post('/trip-planner', protect, aiLimiter, planTrip);

module.exports = router;
