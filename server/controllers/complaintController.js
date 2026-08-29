const Complaint = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');
const Notification = require('../models/Notification');
const User = require('../models/User');
const generateComplaintId = require('../utils/generateComplaintId');
const { uploadFileToStorage } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const {
  ROLES,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
  NOTIFICATION_TYPES,
} = require('../utils/constants');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority } = req.body;

    if (!title || !description || !category || !location) {
      return sendError(
        res,
        'Please fill all required fields: title, description, category, location',
        400
      );
    }

    // Process file attachments (Multer files)
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadFileToStorage(file, 'campus_resolve/complaints');
        attachments.push(uploaded);
      }
    }

    // Generate unique complaint ID (CMP-YYYY-XXXX)
    const complaintId = await generateComplaintId();

    const newComplaint = await Complaint.create({
      complaintId,
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      priority: priority && Object.values(COMPLAINT_PRIORITY).includes(priority)
        ? priority
        : COMPLAINT_PRIORITY.MEDIUM,
      status: COMPLAINT_STATUS.SUBMITTED,
      student: req.user._id,
      attachments,
    });

    // Create Initial StatusHistory record
    await StatusHistory.create({
      complaint: newComplaint._id,
      status: COMPLAINT_STATUS.SUBMITTED,
      changedBy: req.user._id,
      comment: 'Complaint submitted by student.',
    });

    // Notify Admins about new complaint
    const admins = await User.find({ role: ROLES.ADMIN, isActive: true });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        complaint: newComplaint._id,
        message: `New complaint filed: [${complaintId}] ${title}`,
        type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
        link: `/admin/complaints/${newComplaint._id}`,
      });
    }

    // Populate student details
    const populatedComplaint = await Complaint.findById(newComplaint._id).populate(
      'student',
      'name email studentId department phone'
    );

    return sendSuccess(
      res,
      'Complaint submitted successfully',
      { complaint: populatedComplaint },
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's complaints
// @route   GET /api/complaints/my
// @access  Private (Student)
const getMyComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, search, page = 1, limit = 10 } = req.query;

    const query = { student: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (priority && priority !== 'ALL') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('department', 'name')
      .populate('assignedStaff', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Summary counts for student dashboard
    const allStudentComplaints = await Complaint.find({ student: req.user._id });
    const stats = {
      total: allStudentComplaints.length,
      submitted: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.SUBMITTED).length,
      underReview: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.UNDER_REVIEW).length,
      assigned: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.ASSIGNED).length,
      inProgress: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.IN_PROGRESS).length,
      resolved: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.RESOLVED).length,
      closed: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.CLOSED).length,
      reopened: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.REOPENED).length,
      rejected: allStudentComplaints.filter((c) => c.status === COMPLAINT_STATUS.REJECTED).length,
    };

    return sendSuccess(res, 'Student complaints retrieved successfully', {
      complaints,
      stats,
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

// @desc    Get single complaint details (accessible by Student owner, Assigned Staff, or Admin)
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email studentId department phone profileImage')
      .populate('department', 'name description contactEmail contactPhone')
      .populate('assignedStaff', 'name email phone')
      .populate('resolution.resolvedBy', 'name email role');

    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    // Role-based authorization check:
    // If Student, must be the owner.
    // If Staff, should be assigned staff or department staff.
    // Admin has full access.
    if (
      req.user.role === ROLES.STUDENT &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 'You are not authorized to view this complaint', 403);
    }

    // Fetch complete Status Timeline
    const statusTimeline = await StatusHistory.find({ complaint: complaint._id })
      .populate('changedBy', 'name role email')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: 1 });

    return sendSuccess(res, 'Complaint details retrieved successfully', {
      complaint,
      statusTimeline,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student closes a resolved or active complaint
// @route   PATCH /api/complaints/:id/close
// @access  Private (Student only)
const closeComplaint = async (req, res, next) => {
  try {
    const { rating, feedbackComment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    if (complaint.student.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the complaint owner can close this complaint', 403);
    }

    if (complaint.status === COMPLAINT_STATUS.CLOSED) {
      return sendError(res, 'Complaint is already closed', 400);
    }

    complaint.status = COMPLAINT_STATUS.CLOSED;
    complaint.closedAt = new Date();

    if (rating) {
      complaint.feedback = {
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: feedbackComment ? feedbackComment.trim() : '',
        createdAt: new Date(),
      };
    }

    await complaint.save();

    // Log in Status History
    await StatusHistory.create({
      complaint: complaint._id,
      status: COMPLAINT_STATUS.CLOSED,
      changedBy: req.user._id,
      comment: feedbackComment
        ? `Complaint closed by student. Rating: ${rating || 'N/A'}/5. Feedback: ${feedbackComment}`
        : `Complaint verified and closed by student. Rating: ${rating || 'N/A'}/5.`,
    });

    // Notify assigned staff & admins
    if (complaint.assignedStaff) {
      await Notification.create({
        user: complaint.assignedStaff,
        complaint: complaint._id,
        message: `Complaint [${complaint.complaintId}] closed by student with rating ${rating || 'N/A'}/5.`,
        type: NOTIFICATION_TYPES.COMPLAINT_CLOSED,
        link: `/staff/complaints/${complaint._id}`,
      });
    }

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId department')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email');

    return sendSuccess(res, 'Complaint closed successfully. Thank you for your feedback!', {
      complaint: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student reopens an unresolved complaint
// @route   PATCH /api/complaints/:id/reopen
// @access  Private (Student only)
const reopenComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return sendError(res, 'Please provide a reason for reopening this complaint', 400);
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    if (complaint.student.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the complaint owner can reopen this complaint', 403);
    }

    if (
      complaint.status !== COMPLAINT_STATUS.RESOLVED &&
      complaint.status !== COMPLAINT_STATUS.CLOSED &&
      complaint.status !== COMPLAINT_STATUS.IN_PROGRESS
    ) {
      return sendError(
        res,
        `Cannot reopen a complaint currently in status: ${complaint.status}`,
        400
      );
    }

    complaint.status = COMPLAINT_STATUS.REOPENED;
    complaint.reopenReason = reason.trim();
    await complaint.save();

    // Log in Status History
    await StatusHistory.create({
      complaint: complaint._id,
      status: COMPLAINT_STATUS.REOPENED,
      changedBy: req.user._id,
      comment: `Complaint reopened by student. Reason: ${reason.trim()}`,
    });

    // Notify assigned staff & admins
    if (complaint.assignedStaff) {
      await Notification.create({
        user: complaint.assignedStaff,
        complaint: complaint._id,
        message: `Complaint [${complaint.complaintId}] has been REOPENED by the student: "${reason.trim()}"`,
        type: NOTIFICATION_TYPES.COMPLAINT_REOPENED,
        link: `/staff/complaints/${complaint._id}`,
      });
    }

    const admins = await User.find({ role: ROLES.ADMIN, isActive: true });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        complaint: complaint._id,
        message: `Complaint [${complaint.complaintId}] was REOPENED by student: "${reason.trim()}"`,
        type: NOTIFICATION_TYPES.COMPLAINT_REOPENED,
        link: `/admin/complaints/${complaint._id}`,
      });
    }

    const updated = await Complaint.findById(complaint._id)
      .populate('student', 'name email studentId department')
      .populate('department', 'name')
      .populate('assignedStaff', 'name email');

    return sendSuccess(res, 'Complaint reopened successfully', { complaint: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit or update feedback for resolved complaint
// @route   POST /api/complaints/:id/feedback
// @access  Private (Student)
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Please provide a valid rating between 1 and 5', 400);
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    if (complaint.student.toString() !== req.user._id.toString()) {
      return sendError(res, 'Only the complaint owner can submit feedback', 403);
    }

    complaint.feedback = {
      rating: Number(rating),
      comment: (comment || '').trim(),
      createdAt: new Date(),
    };

    await complaint.save();

    return sendSuccess(res, 'Feedback submitted successfully', { complaint });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  closeComplaint,
  reopenComplaint,
  submitFeedback,
};
