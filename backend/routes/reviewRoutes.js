/**
 * Review Routes — Role-Based
 * Maps HTTP methods to review controller handlers with authorization.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  createReview,
  getMyReviews,
  getHomestayReviews,
  replyToReview,
  deleteReview,
  updateReview,
  getAllReviews,
} = require('../controllers/reviewController');

// Admin: get all reviews across platform
router.get('/', protect, authorize('admin'), getAllReviews);

// Customer: get own reviews
router.get('/mine', protect, authorize('customer'), getMyReviews);

// Owner/Admin: get reviews for a specific homestay
router.get('/homestay/:homestayId', protect, authorize('owner', 'admin'), getHomestayReviews);

// Customer: create a review
router.post('/', protect, authorize('customer'), createReview);

// Owner: reply to a review
router.patch('/:id/reply', protect, authorize('owner', 'admin'), replyToReview);

// Customer/Admin: update a review
router.put('/:id', protect, authorize('customer', 'admin'), updateReview);

// Customer/Admin: delete a review
router.delete('/:id', protect, authorize('customer', 'admin'), deleteReview);

module.exports = router;
