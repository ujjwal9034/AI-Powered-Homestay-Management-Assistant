/**
 * Authorization Middleware
 * Restricts route access based on user roles.
 *
 * Usage: router.get('/admin-only', protect, authorize('admin'), handler)
 */

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — please log in',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden — role '${req.user.role}' does not have access to this resource`,
      });
    }

    next();
  };
};

module.exports = { authorize };
