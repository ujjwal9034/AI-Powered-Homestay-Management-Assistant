/**
 * Coupon Controller
 * Handles validation and creation of checkout promo code discount coupons.
 */

const Coupon = require('../models/Coupon');

/**
 * POST /api/coupons/validate
 * Public/Protected — Validate coupon code and return discount amount.
 */
const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }

    const uppercaseCode = code.trim().toUpperCase();

    // Auto-seed demo coupons if coupon database is empty for easy testing
    const count = await Coupon.countDocuments();
    if (count === 0) {
      await Coupon.create([
        { code: 'WELCOME10', discountPercent: 10, isActive: true },
        { code: 'STAYWISE20', discountPercent: 20, isActive: true },
      ]);
    }

    const coupon = await Coupon.findOne({ code: uppercaseCode });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid promo code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This promo code is no longer active' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'This promo code has expired' });
    }

    res.status(200).json({
      success: true,
      message: `Promo code '${uppercaseCode}' applied successfully!`,
      data: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      },
    });
  } catch (error) {
    console.error('[validateCoupon] Error:', error.message);
    res.status(500).json({ success: false, message: 'Coupon validation failed', error: error.message });
  }
};

/**
 * POST /api/coupons
 * Admin only — Create a new promo code coupon.
 */
const createCoupon = async (req, res) => {
  try {
    const { code, discountPercent, expiresAt } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ success: false, message: 'Code and discountPercent are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercent: Number(discountPercent),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'New promo coupon created successfully',
      data: coupon,
    });
  } catch (error) {
    console.error('[createCoupon] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create coupon', error: error.message });
  }
};

module.exports = { validateCoupon, createCoupon };
