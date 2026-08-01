/**
 * Health Controller
 * Returns server health status and public platform stats.
 */

const User = require('../models/User');
const Review = require('../models/Review');
const Homestay = require('../models/Homestay');
const Booking = require('../models/Booking');

const getHealth = (req, res) => {
  const rawUri = process.env.MONGO_URI || '';
  const maskedUri = rawUri.replace(/:([^:@]+)@/, ':****@');
  res.status(200).json({
    status: 'ok',
    success: true,
    message: 'StayWise API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    env: {
      MONGO_URI: maskedUri,
      VITE_API_URL: process.env.VITE_API_URL || 'NOT_SET',
      FRONTEND_URL: process.env.FRONTEND_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    }
  });
};

/**
 * GET /api/health/stats
 * Public — returns aggregate platform stats for the About page.
 */
const getPublicStats = async (req, res) => {
  try {
    const [totalHomestays, totalReviews, totalUsers, totalBookings] = await Promise.all([
      Homestay.countDocuments(),
      Review.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { totalHomestays, totalReviews, totalUsers, totalBookings },
    });
  } catch (error) {
    console.error('[getPublicStats] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

module.exports = { getHealth, getPublicStats };

