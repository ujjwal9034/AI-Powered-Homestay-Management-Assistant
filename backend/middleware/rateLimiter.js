/**
 * Rate Limiter Middleware (express-rate-limit)
 * Limits repeated requests to authentication endpoints.
 *
 * Week 6 — Returns 429 Too Many Requests after threshold is exceeded.
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication routes.
 * 10 requests per 15-minute window.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Limit each IP to 10 requests per window
  standardHeaders: true,     // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,      // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

module.exports = { authLimiter };
