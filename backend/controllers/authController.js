/**
 * Auth Controller
 * Handles user registration, login, logout, profile retrieval, and Google OAuth.
 *
 * Registration accepts an optional `role` field (customer or owner).
 * Admin role is never self-assignable.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a JWT token for a user
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * POST /api/auth/register
 * Register a new user account.
 * Accepts optional role: 'customer' (default) or 'owner'.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Validate role — only customer or owner can be self-assigned
    const validRole = ['customer', 'owner'].includes(role) ? role : 'customer';

    // Create user (password is hashed automatically by pre-save hook)
    const user = await User.create({ name, email, password, role: validRole });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages,
      });
    }

    console.error('[register] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create account',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return token.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user has a password (OAuth-only users don't)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google sign-in. Please use the Google login button.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        token,
      },
    });
  } catch (error) {
    console.error('[login] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout the current user.
 */
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * GET /api/auth/me
 * Get current logged-in user profile (protected route).
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        googleId: user.googleId ? true : false,
        wishlist: user.wishlist || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[getMe] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback.
 * Generates a JWT and redirects to the frontend with the token.
 */
const googleCallback = (req, res) => {
  try {
    const token = generateToken(req.user._id);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Redirect to frontend with token as query parameter
    res.redirect(`${frontendURL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('[googleCallback] Error:', error.message);
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/login?error=oauth_failed`);
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, phone, avatar, password } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      if (user.googleId) {
        return res.status(400).json({ success: false, message: 'Google OAuth accounts cannot set a password.' });
      }
      user.password = password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        googleId: user.googleId ? true : false,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[updateProfile] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/wishlist
 * Get current user's wishlist.
 */
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name location image pricePerNight rating totalReviews amenities'
    });
    res.status(200).json({
      success: true,
      data: user.wishlist || [],
    });
  } catch (error) {
    console.error('[getWishlist] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist', error: error.message });
  }
};

/**
 * POST /api/auth/wishlist/:homestayId
 * Toggle homestay in user's wishlist.
 */
const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const homestayId = req.params.homestayId;

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.indexOf(homestayId);
    let message = '';
    let isWishlisted = false;

    if (index === -1) {
      user.wishlist.push(homestayId);
      message = 'Added to wishlist';
      isWishlisted = true;
    } else {
      user.wishlist.splice(index, 1);
      message = 'Removed from wishlist';
      isWishlisted = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message,
      isWishlisted,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error('[toggleWishlist] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to toggle wishlist', error: error.message });
  }
};

module.exports = { register, login, logout, getMe, googleCallback, updateProfile, getWishlist, toggleWishlist };


