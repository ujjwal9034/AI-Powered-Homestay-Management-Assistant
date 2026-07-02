/**
 * Auth Routes
 * Maps HTTP methods to auth controller handlers.
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route (requires JWT)
router.get('/me', protect, getMe);

module.exports = router;
