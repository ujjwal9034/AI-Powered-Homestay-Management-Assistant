/**
 * Review Model (Mongoose Schema)
 * Defines the structure for guest reviews stored in MongoDB.
 *
 * Fields:
 *   - guest        : Name of the guest who left the review
 *   - platform     : Platform the review came from (Airbnb, Booking.com, Google)
 *   - rating       : Numeric rating between 1 and 5
 *   - text         : Review content / comment
 *   - date         : Human-readable date string (e.g. "2 hours ago")
 *   - status       : Review status — "pending", "replied", or "flagged"
 *   - aiSuggestion : AI-generated response suggestion (nullable)
 *   - createdAt    : Timestamp when the review was created
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    guest: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    date: {
      type: String,
      default: 'Just now',
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'flagged'],
      default: 'pending',
    },
    aiSuggestion: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Adds createdAt and updatedAt timestamps automatically
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
