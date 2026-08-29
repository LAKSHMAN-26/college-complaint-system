const Complaint = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');
const Notification = require('../models/Notification');
const Department = require('../models/Department');
const User = require('../models/User');
const { uploadFileToStorage } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const {
  ROLES,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  NOTIFICATION_TYPES,
} = require('../utils/constants');

// @desc    Get all complaints with full filtering, search & pagination (Admin/Staff)
// @route   GET /api/admin/complaints
// @access  Private (Admin or Staff)
const getAllComplaints = async (req, res, next) => {
  try {
    const {
      status,
      category,
      priority,
      department,
      assignedStaff,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // If Staff is requesting and not Admin, limit to their department or assigned complaints
    if (req.user.role === ROLES.STAFF) {
      if (req.user.departmentRef) {
        query.$or = [
          { assignedStaff: req.user._id },
          { department: req.user.departmentRef },
        ];
      } else {
        query.assignedStaff = req.user._id;
      }
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (department && department !== 'ALL') {
      query.department = department;
    }

    if (assignedStaff && assignedStaff !== 'ALL') {
      query.assignedStaff = assignedStaff;
    }

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('student', 'name email studentId department phone profileImage')
      .populate('department', 'name contactEmail')
      .populate('assignedStaff', 'name email phone')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, 'Complaints fetched successfully', {
      complaints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed statistics and chart analytics for Admin Dashboard
// @route   GET /api/admin/statistics
// @access  Private (Admin / Staff)
const getStatistics = async (req, res, next) => {
  try {
    const allComplaints = await Complaint.find({}).populate('department', 'name');

    // Counts by status
    const statusCounts = {
      total: allComplaints.length,
      submitted: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.SUBMITTED).length,
      underReview: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.UNDER_REVIEW).length,
      assigned: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.ASSIGNED).length,
      inProgress: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.IN_PROGRESS).length,
      resolved: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.RESOLVED).length,
      closed: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.CLOSED).length,
      reopened: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.REOPENED).length,
      rejected: allComplaints.filter((c) => c.status === COMPLAINT_STATUS.REJECTED).length,
    };

    // Category distribution for charts
    const categoryMap = {};
    allComplaints.forEach((c) => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
    });
    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      count: categoryMap[cat],
    }));

    // Priority distribution
    const priorityMap = {
      [COMPLAINT_PRIORITY.LOW]: 0,
      [COMPLAINT_PRIORITY.MEDIUM]: 0,
      [COMPLAINT_PRIORITY.HIGH]: 0,
      [COMPLAINT_PRIORITY.CRITICAL]: 0,
    };
    allComplaints.forEach((c) => {
      if (priorityMap[c.priority] !== undefined) {
        priorityMap[c.priority] += 1;
      }
    });
    const priorityDistribution = Object.keys(priorityMap).map((p) => ({
      name: p,
      count: priorityMap[p],
    }));

    // Department breakdown
    const departmentMap = {};
    allComplaints.forEach((c) => {
      const deptName = c.department ? c.department.name : 'Unassigned';
      departmentMap[deptName] = (departmentMap[deptName] || 0) + 1;
    });
    const departmentDistribution = Object.keys(departmentMap).map((dept) => ({
      name: dept,
      count: departmentMap[dept],
    }));

    // Resolution Time Average calculation (in hours)
    const resolvedComplaints = allComplaints.filter(
      (c) => c.resolution && c.resolution.resolvedAt
    );
    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((acc, curr) => {
        const diffMs = new Date(curr.resolution.resolvedAt) - new Date(curr.createdAt);
        return acc + diffMs / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = (totalHours / resolvedComplaints.length).toFixed(1);
    }

    // Monthly trends (past 6 months)
    const monthlyTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      const year = d.getFullYear();
      const nextM = new Date(year, d.getMonth() + 1, 1);

      const countTotal = allComplaints.filter(
        (c) => new Date(c.createdAt) >= d && new Date(c.createdAt) < nextM
      ).length;

      const countResolved = allComplaints.filter(
        (c) =>
          c.resolution &&
          c.resolution.resolvedAt &&
          new Date(c.resolution.resolvedAt) >= d &&
          new Date(c.resolution.resolvedAt) < nextM
      ).length;

      monthlyTrends.push({
        month: `${mName} ${year}`,
        submitted: countTotal,
        resolved: countResolved,
      });
    }

    // Recent activity
    const recentComplaints = await Complaint.find({})
      .populate('student', 'name studentId department')
      .populate('department', 'name')
      .populate('assignedStaff', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    return sendSuccess(res, 'Analytics statistics retrieved', {
      statusCounts,
      categoryDistribution,
      priorityDistribution,
      departmentDistribution,
      avgResolutionHours: Number(avgResolutionHours),
      monthlyTrends,
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign Department & Staff to a complaint
// @route   PATCH /api/admin/complaints/:id/assign
// @access  Private (Admin)
const assignDepartmentAndStaff = async (req, res, next) => {
  try {
    const { departmentId, staffId, comment } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    let deptDoc = null;
    if (departmentId) {
      deptDoc = await Department.findById(departmentId);
      if (!deptDoc) {
        return sendError(res, 'Selected department does not exist', 400);
      }
      complaint.department = deptDoc._id;
    }

    let staffDoc = null;
    if (staffId) {
      staffDoc = await User.findOne({ _id: staffId, role: ROLES.STAFF });
      if (!staffDoc) {
        return sendError(res, 'Selected staff member does not exist or is not active', 400);
      }
      complaint.assignedStaff = staffDoc._id;
    }

    // Auto-update status to ASSIGNED if currently SUBMITTED or UNDER_REVIEW
    if (
      complaint.status === COMPLAINT_STATUS.SUBMITTED ||
      complaint.status === COMPLAINT_STATUS.UNDER_REVIEW ||
      complaint.status === COMPLAINT_STATUS.REOPENED
    ) {
      complaint.status = COMPLAINT_STATUS.ASSIGNED;
    }

    await complaint.save();

    // Log in Status History
    await StatusHistory.create({
      complaint: complaint._id,
      status: complaint.status,
      changedBy: req.user._id,
      department: deptDoc ? deptDoc._id : undefined,
      assignedStaff: staffDoc ? staffDoc._id : undefined,
      comment:
        comment ||
        `Assigned to ${deptDoc ? deptDoc.name : 'Department'}${
          staffDoc ? ` and Staff member ${staffDoc.name}` : ''
        }`,
    });

    // Notify Student
    await Notification.create({
      user: complaint.student,
      complaint: complaint._id,
      message: `Your complaint [${complaint.complaintId}] has been assigned to ${
        deptDoc ? deptDoc.name : 'support department'
      }.`,
      type: NOTIFICATION_TYPES.STAFF_ASSIGNED,
      link: `/student/complaints/${complaint._id}`,
    });

    // Notify Staff Member
    if (staffDoc) {
      await Notification.create({
        user: staffDoc._id,
        complaint: complaint._id,
        message: `New ticket assigned to you: [${complaint.complaintId}] ${complaint.title}`,
        type: NOTIFICATION_TYPES.STAFF_ASSIGNED,
        link: `/staff/complaints/${complaint._id}`,
      });
    }

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId department phone')
      .populate('department', 'name contactEmail')
      .populate('assignedStaff', 'name email phone');

    return sendSuccess(res, 'Complaint assigned successfully', { complaint: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status (Admin / Staff)
// @route   PATCH /api/admin/complaints/:id/status
// @access  Private (Admin / Staff)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, comment, rejectionReason } = req.body;

    if (!status || !Object.values(COMPLAINT_STATUS).includes(status)) {
      return sendError(res, 'Please provide a valid complaint status', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    // Role safety: Staff can only set IN_PROGRESS or RESOLVED
    if (req.user.role === ROLES.STAFF) {
      if (
        status !== COMPLAINT_STATUS.IN_PROGRESS &&
        status !== COMPLAINT_STATUS.RESOLVED
      ) {
        return sendError(
          res,
          'Staff members can only transition tickets to IN_PROGRESS or RESOLVED',
          403
        );
      }
    }

    if (status === COMPLAINT_STATUS.REJECTED) {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        return sendError(res, 'A rejection reason is required when rejecting a complaint', 400);
      }
      complaint.rejectionReason = rejectionReason.trim();
    }

    complaint.status = status;
    await complaint.save();

    // Log status history
    await StatusHistory.create({
      complaint: complaint._id,
      status,
      changedBy: req.user._id,
      comment:
        comment ||
        (status === COMPLAINT_STATUS.REJECTED
          ? `Complaint rejected: ${rejectionReason}`
          : `Status changed to ${status} by ${req.user.name} (${req.user.role})`),
    });

    // Notify Student
    await Notification.create({
      user: complaint.student,
      complaint: complaint._id,
      message: `Status updated for [${complaint.complaintId}]: ${status}`,
      type: NOTIFICATION_TYPES.STATUS_UPDATED,
      link: `/student/complaints/${complaint._id}`,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId department')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email phone');

    return sendSuccess(res, `Status updated to ${status}`, { complaint: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint priority (Admin)
// @route   PATCH /api/admin/complaints/:id/priority
// @access  Private (Admin)
const updateComplaintPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;

    if (!priority || !Object.values(COMPLAINT_PRIORITY).includes(priority)) {
      return sendError(res, 'Please provide a valid priority: LOW, MEDIUM, HIGH, CRITICAL', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    complaint.priority = priority;
    await complaint.save();

    return sendSuccess(res, `Priority updated to ${priority}`, { complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    Add resolution details & mark as RESOLVED (Admin / Staff)
// @route   PATCH /api/admin/complaints/:id/resolve
// @access  Private (Admin / Staff)
const resolveComplaint = async (req, res, next) => {
  try {
    const { resolutionText } = req.body;

    if (!resolutionText || resolutionText.trim().length === 0) {
      return sendError(res, 'Please provide resolution details/remarks', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    // Process evidence attachments if any
    const evidence = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadFileToStorage(file, 'campus_resolve/resolutions');
        evidence.push(uploaded);
      }
    }

    complaint.status = COMPLAINT_STATUS.RESOLVED;
    complaint.resolution = {
      text: resolutionText.trim(),
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
      evidence,
    };

    await complaint.save();

    // Log status history
    await StatusHistory.create({
      complaint: complaint._id,
      status: COMPLAINT_STATUS.RESOLVED,
      changedBy: req.user._id,
      comment: `Complaint resolved by ${req.user.name} (${req.user.role}): "${resolutionText.trim()}"`,
    });

    // Notify student
    await Notification.create({
      user: complaint.student,
      complaint: complaint._id,
      message: `Your complaint [${complaint.complaintId}] has been marked as RESOLVED. Please review and close it.`,
      type: NOTIFICATION_TYPES.COMPLAINT_RESOLVED,
      link: `/student/complaints/${complaint._id}`,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId department')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email')
      .populate('resolution.resolvedBy', 'name role email');

    return sendSuccess(res, 'Complaint resolved successfully', { complaint: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff members (Admin)
// @route   GET /api/admin/staff
// @access  Private (Admin)
const getAllStaff = async (req, res, next) => {
  try {
    const staffMembers = await User.find({ role: ROLES.STAFF })
      .populate('departmentRef', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Staff members retrieved successfully', {
      staff: staffMembers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new staff member (Admin)
// @route   POST /api/admin/staff
// @access  Private (Admin)
const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, departmentId, phone } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, 'An account with this email already exists', 400);
    }

    let deptDoc = null;
    if (departmentId) {
      deptDoc = await Department.findById(departmentId);
    }

    const newStaff = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: ROLES.STAFF,
      department: deptDoc ? deptDoc.name : undefined,
      departmentRef: deptDoc ? deptDoc._id : undefined,
      phone: (phone || '').trim(),
    });

    // Add to department staff list
    if (deptDoc) {
      deptDoc.staff.push(newStaff._id);
      await deptDoc.save();
    }

    const populatedStaff = await User.findById(newStaff._id)
      .populate('departmentRef', 'name')
      .select('-password');

    return sendSuccess(res, 'Staff account created successfully', { staff: populatedStaff }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member (Admin)
// @route   PUT /api/admin/staff/:id
// @access  Private (Admin)
const updateStaff = async (req, res, next) => {
  try {
    const { name, departmentId, phone, isActive } = req.body;
    const staff = await User.findOne({ _id: req.params.id, role: ROLES.STAFF });

    if (!staff) {
      return sendError(res, 'Staff member not found', 404);
    }

    if (name) staff.name = name.trim();
    if (phone !== undefined) staff.phone = phone.trim();
    if (isActive !== undefined) staff.isActive = Boolean(isActive);

    if (departmentId !== undefined) {
      if (departmentId) {
        const deptDoc = await Department.findById(departmentId);
        if (deptDoc) {
          staff.departmentRef = deptDoc._id;
          staff.department = deptDoc.name;
          // Ensure staff ID is in department's staff list
          if (!deptDoc.staff.includes(staff._id)) {
            deptDoc.staff.push(staff._id);
            await deptDoc.save();
          }
        }
      } else {
        staff.departmentRef = null;
        staff.department = '';
      }
    }

    await staff.save();

    const updated = await User.findById(staff._id)
      .populate('departmentRef', 'name')
      .select('-password');

    return sendSuccess(res, 'Staff updated successfully', { staff: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllComplaints,
  getStatistics,
  assignDepartmentAndStaff,
  updateComplaintStatus,
  updateComplaintPriority,
  resolveComplaint,
  getAllStaff,
  createStaff,
  updateStaff,
};
