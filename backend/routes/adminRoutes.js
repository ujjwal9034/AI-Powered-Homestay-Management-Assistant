/**
 * Admin Routes
 * Platform management routes — admin only.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  toggleUserBan,
  verifyOwnerStatus,
  getAuditLogs,
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/ban', toggleUserBan);
router.patch('/users/:id/verify-owner', verifyOwnerStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
