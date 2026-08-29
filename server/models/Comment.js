const mongoose = require('mongoose');

const commentAttachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    filename: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    mimetype: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const commentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Comment message cannot be empty'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters'],
    },
    attachments: [commentAttachmentSchema],
    isInternal: {
      type: Boolean,
      default: false, // Internal notes for staff/admin only
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Comment', commentSchema);
