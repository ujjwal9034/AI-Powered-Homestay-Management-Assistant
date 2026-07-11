/**
 * Auth Routes
 * Maps HTTP methods to auth controller handlers.
 *
 * Week 6 — Added logout, Google OAuth routes, rate limiting, and validation.
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { register, login, logout, getMe, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation, validate } = require('../middleware/validators');

// ─── Public routes (with rate limiting + validation) ────────────────────────────
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);

// ─── Protected routes (requires JWT) ────────────────────────────────────────────
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

// ─── Google OAuth routes ────────────────────────────────────────────────────────
// Only register routes if Google OAuth is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', {
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
      session: false,
    }),
    googleCallback
  );
}

module.exports = router;
