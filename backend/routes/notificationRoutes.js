/**
 * Notification Routes
 * Mounts secure endpoints to fetch and read notifications.
 */

const express = require('express');
const router = express.Router();
const { getMyNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All notification endpoints require user login
router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);

module.exports = router;
