/**
 * Message Controller
 * Handles direct messaging, chat contacts aggregate list, and message log retrievals.
 */

const Message = require('../models/Message');
const User = require('../models/User');

/**
 * POST /api/messages
 * Protected — Send a new private message to a recipient.
 */
const sendMessage = async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId || !text) {
      return res.status(400).json({ success: false, message: 'Recipient ID and message text are required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipientId,
      text,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('[sendMessage] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

/**
 * GET /api/messages/:userId
 * Protected — Retrieve messages exchanged with a specific user.
 */
const getMessagesWithUser = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('[getMessagesWithUser] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch messages', error: error.message });
  }
};

/**
 * GET /api/messages/contacts
 * Protected — Aggregate unique users with whom current user has chat logs.
 */
const getChatContacts = async (req, res) => {
  try {
    // Find all messages sent or received by user
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    });

    // Extract unique contact IDs (excluding current user)
    const contactIdsSet = new Set();
    messages.forEach((msg) => {
      const sId = msg.sender.toString();
      const rId = msg.recipient.toString();
      if (sId !== req.user._id.toString()) contactIdsSet.add(sId);
      if (rId !== req.user._id.toString()) contactIdsSet.add(rId);
    });

    const contactIds = Array.from(contactIdsSet);
    const contacts = await User.find({ _id: { $in: contactIds } }).select('name email role avatar');

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error('[getChatContacts] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch chat contacts', error: error.message });
  }
};

module.exports = { sendMessage, getMessagesWithUser, getChatContacts };
