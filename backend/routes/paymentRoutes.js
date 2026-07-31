/**
 * Payment Routes
 * API endpoints for initializing payment sessions, verifying gateway payments,
 * and generating payment receipts.
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPaymentSession,
  verifyPayment,
  getPaymentReceipt,
} = require('../controllers/paymentController');

// Guest endpoints
router.post('/create-session', protect, authorize('customer'), createPaymentSession);
router.post('/verify', protect, authorize('customer'), verifyPayment);

// Payment receipt / invoice endpoint (Guest, Host, Admin)
router.get('/receipt/:bookingId', protect, getPaymentReceipt);

module.exports = router;
