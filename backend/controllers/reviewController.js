/**
 * Review Controller — Role-Based
 * Handles review operations with strict access control.
 *
 * - Customer: create, read own, edit own, delete own
 * - Owner:   read reviews for own homestays, reply
 * - Admin:   read all, delete any
 */

const Review = require('../models/Review');
const Homestay = require('../models/Homestay');

/**
 * POST /api/reviews
 * Customer only — create a review for a homestay.
 */
const createReview = async (req, res) => {
  try {
    const { homestayId, rating, text } = req.body;

    if (!homestayId || rating == null || !text) {
      return res.status(400).json({ success: false, message: 'homestayId, rating, and text are required' });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    // Verify the homestay exists
    const homestay = await Homestay.findById(homestayId);
    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Prevent owners from reviewing their own homestay
    if (homestay.owner.toString() === req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot review your own homestay' });
    }

    const review = await Review.create({
      customer: req.user._id,
      homestay: homestayId,
      rating,
      text,
    });

    // Update homestay stats
    const allReviews = await Review.find({ homestay: homestayId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Homestay.findByIdAndUpdate(homestayId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    // Populate customer data for the response
    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatar')
      .populate('homestay', 'name location');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
    }
    console.error('[createReview] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create review', error: error.message });
  }
};

/**
 * GET /api/reviews/mine
 * Customer only — returns only reviews written by the current user.
 */
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('homestay', 'name location image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('[getMyReviews] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch your reviews', error: error.message });
  }
};

/**
 * GET /api/reviews/homestay/:homestayId
 * Owner (own homestay) or Admin — returns all reviews for a specific homestay.
 */
const getHomestayReviews = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.homestayId);

    if (!homestay) {
      return res.status(404).json({ success: false, message: 'Homestay not found' });
    }

    // Only the owner of this homestay or an admin can see all reviews
    if (homestay.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only view reviews for your own homestays' });
    }

    const reviews = await Review.find({ homestay: req.params.homestayId })
      .populate('customer', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid homestay ID format' });
    }
    console.error('[getHomestayReviews] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
};

/**
 * PATCH /api/reviews/:id/reply
 * Owner only — reply to a review on their own homestay.
 */
const replyToReview = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const review = await Review.findById(req.params.id)
      .populate('homestay', 'owner');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check that the current user owns the homestay this review belongs to
    if (review.homestay.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only reply to reviews on your own homestays' });
    }

    review.ownerReply = {
      text: text.trim(),
      repliedAt: new Date(),
    };
    review.status = 'replied';

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatar')
      .populate('homestay', 'name location');

    res.status(200).json({
      success: true,
      message: 'Reply submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid review ID format' });
    }
    console.error('[replyToReview] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reply to review', error: error.message });
  }
};

/**
 * DELETE /api/reviews/:id
 * Customer (own review) or Admin (any review).
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Customer can delete only their own review, Admin can delete any
    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }

    const homestayId = review.homestay;
    await Review.findByIdAndDelete(req.params.id);

    // Update homestay stats
    const remainingReviews = await Review.find({ homestay: homestayId });
    const avgRating = remainingReviews.length > 0
      ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
      : 0;
    await Homestay.findByIdAndUpdate(homestayId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: remainingReviews.length,
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid review ID format' });
    }
    console.error('[deleteReview] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete review', error: error.message });
  }
};

/**
 * PUT /api/reviews/:id
 * Customer (own review) — update review text and rating.
 */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Only the customer who wrote it can edit (or admin)
    if (review.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own reviews' });
    }

    const { rating, text } = req.body;

    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
      }
      review.rating = rating;
    }
    if (text !== undefined) review.text = text;

    await review.save();

    // Update homestay stats
    const allReviews = await Review.find({ homestay: review.homestay });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Homestay.findByIdAndUpdate(review.homestay, {
      rating: Math.round(avgRating * 10) / 10,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatar')
      .populate('homestay', 'name location');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: populatedReview,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid review ID format' });
    }
    console.error('[updateReview] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update review', error: error.message });
  }
};

/**
 * GET /api/reviews
 * Admin only — all reviews across the platform.
 */
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('customer', 'name email avatar')
      .populate('homestay', 'name location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('[getAllReviews] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  getHomestayReviews,
  replyToReview,
  deleteReview,
  updateReview,
  getAllReviews,
};
