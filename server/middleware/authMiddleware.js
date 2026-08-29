const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_campus_resolve_jwt_key_2026_secure'
      );

      const user = await User.findById(decoded.id).select('-password').populate('departmentRef');

      if (!user) {
        return sendError(res, 'User associated with this token no longer exists', 401);
      }

      if (!user.isActive) {
        return sendError(res, 'User account is deactivated. Contact administrator.', 403);
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return sendError(res, 'Not authorized, token is invalid or expired', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, no token provided', 401);
  }
};

module.exports = { protect };
