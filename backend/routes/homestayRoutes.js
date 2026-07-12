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
} = require('../controllers/homestayController');

// Public routes
router.get('/', getAllHomestays);

// Protected: Owner gets own homestays (must be before /:id)
router.get('/mine', protect, authorize('owner', 'admin'), getMyHomestays);

// Public: single homestay with reviews
router.get('/:id', getHomestayById);

// Protected: Owner creates homestay
router.post('/', protect, authorize('owner', 'admin'), createHomestay);

// Protected: Owner/Admin updates homestay
router.put('/:id', protect, authorize('owner', 'admin'), updateHomestay);

// Protected: Owner/Admin deletes homestay
router.delete('/:id', protect, authorize('owner', 'admin'), deleteHomestay);

module.exports = router;
