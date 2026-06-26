/**
 * Review Controller
 * Handles all CRUD operations for guest reviews using in-memory mock data.
 */

const fs = require('fs');
const path = require('path');

// Load mock data into memory
const dataPath = path.join(__dirname, '..', 'data', 'reviews.json');
let reviews = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

/**
 * GET /api/reviews
 * Returns all reviews.
 */
const getAllReviews = (req, res) => {
  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
};

/**
 * GET /api/reviews/:id
 * Returns a single review by ID.
 */
const getReviewById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const review = reviews.find((r) => r.id === id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: `Review with id ${id} not found`,
    });
  }

  res.status(200).json({
    success: true,
    data: review,
  });
};

/**
 * POST /api/reviews
 * Creates a new review.
 */
const createReview = (req, res) => {
  const { guest, platform, rating, text, status, aiSuggestion } = req.body;

  // Validate required fields
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

  const newReview = {
    id: reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) + 1 : 1,
    guest,
    platform,
    rating,
    text,
    date: 'Just now',
    status: status || 'pending',
    aiSuggestion: aiSuggestion || null,
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    data: newReview,
  });
};

/**
 * PUT /api/reviews/:id
 * Replaces an entire review (full update).
 */
const updateReview = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = reviews.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Review with id ${id} not found`,
    });
  }

  const { guest, platform, rating, text, status, aiSuggestion } = req.body;

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

  reviews[index] = {
    ...reviews[index],
    guest,
    platform,
    rating,
    text,
    status: status || reviews[index].status,
    aiSuggestion: aiSuggestion !== undefined ? aiSuggestion : reviews[index].aiSuggestion,
  };

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: reviews[index],
  });
};

/**
 * PATCH /api/reviews/:id
 * Partially updates a review.
 */
const patchReview = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = reviews.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Review with id ${id} not found`,
    });
  }

  const allowedFields = ['guest', 'platform', 'rating', 'text', 'status', 'aiSuggestion', 'date'];
  const updates = {};

  for (const key of Object.keys(req.body)) {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  }

  if (updates.rating !== undefined) {
    if (typeof updates.rating !== 'number' || updates.rating < 1 || updates.rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields provided for update',
    });
  }

  reviews[index] = { ...reviews[index], ...updates };

  res.status(200).json({
    success: true,
    message: 'Review patched successfully',
    data: reviews[index],
  });
};

/**
 * DELETE /api/reviews/:id
 * Deletes a review by ID.
 */
const deleteReview = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = reviews.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Review with id ${id} not found`,
    });
  }

  const deleted = reviews.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
    data: deleted,
  });
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  patchReview,
  deleteReview,
};
