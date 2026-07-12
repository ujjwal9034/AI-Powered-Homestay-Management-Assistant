/**
 * Homestay Model (Mongoose Schema)
 * Represents a homestay property owned by an Owner user.
 *
 * Each homestay belongs to one owner and can have many reviews.
 */

const mongoose = require('mongoose');

const homestaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Homestay name is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    pricePerNight: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast owner lookup
homestaySchema.index({ owner: 1 });

module.exports = mongoose.model('Homestay', homestaySchema);
