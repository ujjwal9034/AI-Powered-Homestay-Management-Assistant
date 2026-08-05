/**
 * Notification Controller
 * Manages fetching and updating user alerts and notifications.
 */

const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 * Protected — Fetch active alerts for the current logged-in user.
 */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error('[getMyNotifications] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Protected — Mark a notification as read.
 */
const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    console.error('[markNotificationRead] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update notification', error: error.message });
  }
};

module.exports = { getMyNotifications, markNotificationRead };
