/**
 * Homestay Routes
 * Maps HTTP methods to homestay controller handlers.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getAllHomestays,
  getMyHomestays,
  getHomestayById,
  createHomestay,
  updateHomestay,
  deleteHomestay,
  chatWithLocalGuide,
  enhanceHomestayDescription,
  getHostAnalytics,
  suggestHomestayPrice,
} = require('../controllers/homestayController');

// Public routes
router.get('/', getAllHomestays);

// Protected: Owner gets own homestays (must be before /:id)
router.get('/mine', protect, authorize('owner', 'admin'), getMyHomestays);

// Protected: Owner analytics dashboard (must be before /:id)
router.get('/owner/analytics', protect, authorize('owner', 'admin'), getHostAnalytics);

// Protected: Enhance description using Gemini AI (must be before /:id)
router.post('/enhance', protect, authorize('owner', 'admin'), enhanceHomestayDescription);

// Public: single homestay with reviews
router.get('/:id', getHomestayById);

// Public: Chat with homestay AI assistant local guide
router.post('/:id/chat', chatWithLocalGuide);

// Protected: Owner creates homestay
router.post('/', protect, authorize('owner', 'admin'), createHomestay);

// Protected: Owner/Admin updates homestay
router.put('/:id', protect, authorize('owner', 'admin'), updateHomestay);

// Protected: Owner/Admin deletes homestay
router.delete('/:id', protect, authorize('owner', 'admin'), deleteHomestay);

// Protected: AI Dynamic Pricing Advisor
router.post('/:id/suggest-price', protect, authorize('owner', 'admin'), suggestHomestayPrice);

module.exports = router;
