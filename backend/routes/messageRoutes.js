/**
 * Message Routes
 * Mounts endpoints for private guest-host messaging logs.
 */

const express = require('express');
const router = express.Router();
const { sendMessage, getMessagesWithUser, getChatContacts } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All chat routes require JWT Auth
router.use(protect);

router.post('/', sendMessage);
router.get('/contacts', getChatContacts);
router.get('/:userId', getMessagesWithUser);

module.exports = router;
