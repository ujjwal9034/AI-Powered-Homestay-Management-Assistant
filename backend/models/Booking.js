/**
 * Booking Model (Mongoose Schema)
 * Represents a reservation made by a guest for a homestay property.
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required'],
    },
    homestay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guestsCount: {
      type: Number,
      default: 1,
      min: [1, 'Must have at least 1 guest'],
    },
    nights: {
      type: Number,
      required: true,
      min: [1, 'Must book at least 1 night'],
    },
    basePrice: {
      type: Number,
      required: true,
    },
    serviceFee: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed', // Defaults to confirmed for instant booking simulator
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ customer: 1 });
bookingSchema.index({ homestay: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
