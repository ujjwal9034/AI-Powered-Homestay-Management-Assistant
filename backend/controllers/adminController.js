/**
 * Admin Controller
 * Platform-wide management operations for admin users only.
 */

const User = require('../models/User');
const Review = require('../models/Review');
const Homestay = require('../models/Homestay');

/**
 * GET /api/admin/stats
 * Platform-wide statistics.
 */
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalCustomers, totalOwners, totalAdmins, totalReviews, totalHomestays] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'admin' }),
      Review.countDocuments(),
      Homestay.countDocuments(),
    ]);

    const pendingReviews = await Review.countDocuments({ status: 'pending' });
    const repliedReviews = await Review.countDocuments({ status: 'replied' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalOwners,
        totalAdmins,
        totalReviews,
        totalHomestays,
        pendingReviews,
        repliedReviews,
      },
    });
  } catch (error) {
    console.error('[getAdminStats] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: error.message });
  }
};

/**
 * GET /api/admin/users
 * List all users.
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('[getAllUsers] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id
 * Update a user's role.
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['customer', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid role is required (customer, owner, admin)' });
    }

    // Prevent admin from changing own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      data: user,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    console.error('[updateUserRole] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update user role', error: error.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user and their associated data.
 */
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete associated data based on role
    if (user.role === 'customer') {
      await Review.deleteMany({ customer: user._id });
    } else if (user.role === 'owner') {
      const homestays = await Homestay.find({ owner: user._id });
      const homestayIds = homestays.map((h) => h._id);
      await Review.deleteMany({ homestay: { $in: homestayIds } });
      await Homestay.deleteMany({ owner: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `User '${user.name}' and associated data deleted`,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }
    console.error('[deleteUser] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

module.exports = { getAdminStats, getAllUsers, updateUserRole, deleteUser };
