/**
 * Booking Routes
 * Protected endpoints for guest and owner booking flows.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');

// Require authentication for all bookings
router.use(protect);

// Guest endpoints
router.post('/', authorize('customer'), createBooking);
router.get('/mine', authorize('customer'), getMyBookings);

// Owner endpoints
router.get('/owner', authorize('owner', 'admin'), getOwnerBookings);
router.patch('/:id/status', authorize('owner', 'admin'), updateBookingStatus);

module.exports = router;
