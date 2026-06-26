/**
 * Review Routes
 * Maps HTTP methods to review controller handlers.
 */

const express = require('express');
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  patchReview,
  deleteReview,
} = require('../controllers/reviewController');

router.route('/')
  .get(getAllReviews)
  .post(createReview);

router.route('/:id')
  .get(getReviewById)
  .put(updateReview)
  .patch(patchReview)
  .delete(deleteReview);

module.exports = router;
