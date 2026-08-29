const Comment = require('../models/Comment');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { uploadFileToStorage } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { ROLES, NOTIFICATION_TYPES } = require('../utils/constants');

// @desc    Get all comments for a complaint
// @route   GET /api/complaints/:id/comments
// @access  Private
const getComments = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    const query = { complaint: complaint._id };
    // Students cannot see internal staff notes
    if (req.user.role === ROLES.STUDENT) {
      query.isInternal = false;
    }

    const comments = await Comment.find(query)
      .populate('user', 'name role email profileImage')
      .sort({ createdAt: 1 });

    return sendSuccess(res, 'Comments retrieved successfully', { comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { message, isInternal } = req.body;

    if (!message || message.trim().length === 0) {
      return sendError(res, 'Comment message cannot be empty', 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 'Complaint not found', 404);
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadFileToStorage(file, 'campus_resolve/comments');
        attachments.push(uploaded);
      }
    }

    const comment = await Comment.create({
      complaint: complaint._id,
      user: req.user._id,
      message: message.trim(),
      attachments,
      isInternal: req.user.role !== ROLES.STUDENT && Boolean(isInternal),
    });

    // Notify other parties
    // If student commented -> notify assigned staff and admins
    if (req.user.role === ROLES.STUDENT) {
      if (complaint.assignedStaff) {
        await Notification.create({
          user: complaint.assignedStaff,
          complaint: complaint._id,
          message: `New student comment on [${complaint.complaintId}]: "${message.substring(0, 50)}..."`,
          type: NOTIFICATION_TYPES.COMMENT_ADDED,
          link: `/staff/complaints/${complaint._id}`,
        });
      }
    } else {
      // If staff/admin commented and not internal -> notify student
      if (!comment.isInternal) {
        await Notification.create({
          user: complaint.student,
          complaint: complaint._id,
          message: `${req.user.name} (${req.user.role}) added a comment on [${complaint.complaintId}]`,
          type: NOTIFICATION_TYPES.COMMENT_ADDED,
          link: `/student/complaints/${complaint._id}`,
        });
      }
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name role email profileImage'
    );

    return sendSuccess(res, 'Comment posted successfully', { comment: populatedComment }, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  addComment,
};
