/**
 * AuditLog Model (Mongoose Schema)
 * Records security-sensitive and platform-wide administrative actions.
 */

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor is required'],
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetType',
      default: null,
    },
    targetType: {
      type: String,
      enum: ['User', 'Homestay', 'Booking', null],
      default: null,
    },
    details: {
      type: String,
      required: [true, 'Details are required'],
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log creation time
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
