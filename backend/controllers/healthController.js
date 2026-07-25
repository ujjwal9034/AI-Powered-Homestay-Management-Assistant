/**
 * Health Controller
 * Returns server health status and public platform stats.
 */

const User = require('../models/User');
const Review = require('../models/Review');
const Homestay = require('../models/Homestay');
const Booking = require('../models/Booking');

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StayWise API is running',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
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

