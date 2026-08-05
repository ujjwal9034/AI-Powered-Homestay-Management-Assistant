/**
 * Coupon Routes
 * Configures endpoints to validate discount codes and create new ones.
 */

const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon } = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

// All coupon routes require user login
router.use(protect);

router.post('/validate', validateCoupon);
router.post('/', adminOnly, createCoupon);

module.exports = router;
