/**
 * Audit Logger Helper Utility
 * Safely registers audit logs to MongoDB.
 */

const AuditLog = require('../models/AuditLog');

/**
 * Log an administrative or security-sensitive action.
 * @param {Object} param0
 * @param {string} param0.action - The log event name (e.g. USER_BAN)
 * @param {string} param0.actor - The User ID who initiated the event
 * @param {string} [param0.target] - The affected target document ID
 * @param {string} [param0.targetType] - Mongoose model name of target
 * @param {string} param0.details - Description of the action
 * @param {Object} [param0.req] - Express request object for IP mapping
 */
const logAction = async ({ action, actor, target, targetType, details, req }) => {
  try {
    let ipAddress = null;
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      // Clean up IP address if IPv6 mapped IPv4
      if (ipAddress && ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.substring(7);
      }
    }

    await AuditLog.create({
      action,
      actor,
      target: target || null,
      targetType: targetType || null,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('[logAction] Failed to create audit log:', error.message);
  }
};

module.exports = { logAction };
