/**
 * Review Model (Mongoose Schema)
 * Represents a customer review for a homestay property.
 *
 * Each review is linked to:
 *   - customer: The user who wrote the review
 *   - homestay: The property being reviewed
 *
 * Owner replies are stored inline in the ownerReply subdocument.
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
    },
    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay reference is required'],
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
    status: {
      type: String,
      enum: ['pending', 'replied', 'flagged'],
      default: 'pending',
    },
    ownerReply: {
      text: { type: String, default: null },
      repliedAt: { type: Date, default: null },
    },
    aiSuggestion: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
reviewSchema.index({ customer: 1 });
reviewSchema.index({ homestay: 1 });

module.exports = mongoose.model('Review', reviewSchema);
