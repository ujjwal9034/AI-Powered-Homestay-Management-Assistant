/**
 * Auth Controller
 * Handles user registration, login, logout, profile retrieval, and Google OAuth.
 *
 * Registration accepts an optional `role` field (customer or owner).
 * Admin role is never self-assignable.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendWelcomeEmail, sendResetPasswordEmail } = require('../utils/emailService');

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
    const user = await User.create({
      name,
      email,
      password,
      role: validRole,
      ownerStatus: validRole === 'owner' ? 'pending_approval' : 'none',
    });

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user).catch((err) =>
      console.error('[Welcome Email Fail]:', err.message)
    );

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
        needsOnboarding: user.needsOnboarding,
        ownerStatus: user.ownerStatus,
        kycDocument: user.kycDocument,
        isBanned: user.isBanned,
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
        needsOnboarding: user.needsOnboarding,
        avatar: user.avatar,
        ownerStatus: user.ownerStatus,
        kycDocument: user.kycDocument,
        isBanned: user.isBanned,
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
        needsOnboarding: user.needsOnboarding,
        avatar: user.avatar,
        phone: user.phone,
        googleId: user.googleId ? true : false,
        wishlist: user.wishlist || [],
        ownerStatus: user.ownerStatus,
        kycDocument: user.kycDocument,
        isBanned: user.isBanned,
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

/**
 * POST /api/auth/verify-owner
 * Protected — Host submits government ID document and requests verification.
 */
const requestOwnerVerification = async (req, res) => {
  try {
    const { kycDocument } = req.body;
    if (!kycDocument) {
      return res.status(400).json({ success: false, message: 'KYC Document path/URL is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.kycDocument = kycDocument;
    user.ownerStatus = 'pending_approval';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'KYC Document submitted successfully! Verification is pending administrator approval.',
      data: {
        _id: user._id,
        ownerStatus: user.ownerStatus,
        kycDocument: user.kycDocument,
      },
    });
  } catch (error) {
    console.error('[requestOwnerVerification] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit KYC verification details', error: error.message });
  }
};

/**
 * POST /api/auth/forgot-password
 * Public — Requests a password reset link.
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = await User.findOne({ email });
    // Secure design pattern: don't reveal if email exists
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been dispatched.',
      });
    }

    // Generate a 6-digit numeric OTP code (2FA)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP and store on user record
    user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${otp}?email=${encodeURIComponent(user.email)}`;
    console.log(`\n🔑 [PASSWORD RESET REQUESTED]:\nOTP (2FA Code): ${otp}\nReset URL: ${resetUrl}\nExpires: 15 minutes\n`);

    // Dispatch the email containing the OTP code and direct link
    sendResetPasswordEmail(user, otp, resetUrl).catch((err) =>
      console.error('[Reset Email Fail]:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset code has been dispatched.',
      devToken: otp, // For sandbox testing convenience
    });
  } catch (error) {
    console.error('[forgotPassword] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to request password reset', error: error.message });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Public — Resets user password using reset token.
 */
const resetPassword = async (req, res) => {
  try {
    const { password, email, otp } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // OTP/Token can be in the request body (otp) or URL parameter (token)
    const verificationCode = (otp || req.params.token || '').trim();
    if (!verificationCode) {
      return res.status(400).json({ success: false, message: 'Verification code (OTP) is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(verificationCode).digest('hex');

    const query = {
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    };

    // If email is explicitly provided, verify it matches
    if (email) {
      query.email = email.toLowerCase().trim();
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code (2FA OTP)' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('[resetPassword] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
};

/**
 * PUT /api/auth/onboard
 * Complete user onboarding by selecting their role (customer or owner).
 */
const completeOnboarding = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['customer', 'owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selection. Must be either customer or owner.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    user.needsOnboarding = false;
    
    // Set host verification pending if they choose to list homestays
    if (role === 'owner') {
      user.ownerStatus = 'pending_approval';
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        needsOnboarding: user.needsOnboarding,
        avatar: user.avatar,
        phone: user.phone,
        googleId: user.googleId ? true : false,
        wishlist: user.wishlist || [],
        ownerStatus: user.ownerStatus,
        kycDocument: user.kycDocument,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[completeOnboarding] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during onboarding completion',
      error: error.message,
    });
  }
};

module.exports = { register, login, logout, getMe, googleCallback, updateProfile, getWishlist, toggleWishlist, requestOwnerVerification, forgotPassword, resetPassword, completeOnboarding };


