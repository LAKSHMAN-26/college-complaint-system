const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ROLES } = require('../utils/constants');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_campus_resolve_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, department, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    // Determine role - default is STUDENT, allow STAFF or ADMIN if explicitly specified
    const assignedRole = Object.values(ROLES).includes(role) ? role : ROLES.STUDENT;

    let departmentRef = null;
    if (department) {
      const deptDoc = await Department.findOne({
        name: { $regex: new RegExp(`^${department.trim()}$`, 'i') },
      });
      if (deptDoc) {
        departmentRef = deptDoc._id;
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      studentId: assignedRole === ROLES.STUDENT ? (studentId || '').trim() : undefined,
      department: department ? department.trim() : undefined,
      departmentRef,
      phone: (phone || '').trim(),
    });

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      'User registered successfully',
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
          phone: user.phone,
          profileImage: user.profileImage,
        },
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both email and password', 400);
    }

    // Find user with password included
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('departmentRef');

    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 'Logged in successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        departmentRef: user.departmentRef,
        phone: user.phone,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('departmentRef');
    return sendSuccess(res, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (department !== undefined) user.department = department.trim();

    // Password update flow if requested
    if (currentPassword && newPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 'Current password does not match', 400);
      }
      if (newPassword.length < 6) {
        return sendError(res, 'New password must be at least 6 characters', 400);
      }
      user.password = newPassword;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate('departmentRef');
    return sendSuccess(res, 'Profile updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
