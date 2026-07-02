/**
 * Review Controller
 * Handles all CRUD operations for guest reviews using MongoDB (Mongoose).
 */

const Review = require('../models/Review');

/**
 * GET /api/reviews
 * Returns all reviews from the database, sorted by newest first.
 */
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('[getAllReviews] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

/**
 * GET /api/reviews/:id
 * Returns a single review by its MongoDB _id.
 */
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review with id ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: `Invalid review ID format: ${req.params.id}`,
      });
    }

    console.error('[getReviewById] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message,
    });
  }
};

/**
 * POST /api/reviews
 * Creates a new review in the database.
 */
const createReview = async (req, res) => {
  try {
    const { guest, platform, rating, text, date, status, aiSuggestion } = req.body;

    // Manual validation for clearer error messages
    if (!guest || !platform || rating == null || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide guest, platform, rating, and text fields',
      });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    // Create the review document
    const review = await Review.create({
      guest,
      platform,
      rating,
      text,
      date: date || 'Just now',
      status: status || 'pending',
      aiSuggestion: aiSuggestion || null,
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('[createReview] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

/**
 * PUT /api/reviews/:id
 * Replaces an entire review (full update).
 */
const updateReview = async (req, res) => {
  try {
    const { guest, platform, rating, text, status, aiSuggestion } = req.body;

    // PUT requires all main fields
    if (!guest || !platform || rating == null || !text) {
      return res.status(400).json({
        success: false,
        message: 'PUT requires guest, platform, rating, and text fields',
      });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { guest, platform, rating, text, status, aiSuggestion },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review with id ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: `Invalid review ID format: ${req.params.id}`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('[updateReview] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/reviews/:id
 * Partially updates a review (only the fields provided).
 */
const patchReview = async (req, res) => {
  try {
    // Only allow updating specific fields
    const allowedFields = ['guest', 'platform', 'rating', 'text', 'status', 'aiSuggestion', 'date'];
    const updates = {};

    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
      });
    }

    // Validate rating if it's being updated
    if (updates.rating !== undefined) {
      if (typeof updates.rating !== 'number' || updates.rating < 1 || updates.rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a number between 1 and 5',
        });
      }
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review with id ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review patched successfully',
      data: review,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: `Invalid review ID format: ${req.params.id}`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('[patchReview] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to patch review',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/reviews/:id
 * Deletes a review by its MongoDB _id.
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review with id ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: review,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: `Invalid review ID format: ${req.params.id}`,
      });
    }

    console.error('[deleteReview] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  patchReview,
  deleteReview,
};
