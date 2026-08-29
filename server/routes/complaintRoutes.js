const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  closeComplaint,
  reopenComplaint,
  submitFeedback,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { ROLES } = require('../utils/constants');

// Student Complaint Endpoints
router.post(
  '/',
  protect,
  authorize(ROLES.STUDENT),
  upload.array('attachments', 5),
  createComplaint
);

router.get('/my', protect, authorize(ROLES.STUDENT), getMyComplaints);

// View Complaint (Accessible to Student owner, Staff, and Admin)
router.get('/:id', protect, getComplaintById);

// Student actions
router.patch('/:id/close', protect, authorize(ROLES.STUDENT), closeComplaint);
router.patch('/:id/reopen', protect, authorize(ROLES.STUDENT), reopenComplaint);
router.post('/:id/feedback', protect, authorize(ROLES.STUDENT), submitFeedback);

module.exports = router;
