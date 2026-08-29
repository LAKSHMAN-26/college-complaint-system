const express = require('express');
const router = express.Router();
const {
  getAllComplaints,
  getStatistics,
  assignDepartmentAndStaff,
  updateComplaintStatus,
  updateComplaintPriority,
  resolveComplaint,
  getAllStaff,
  createStaff,
  updateStaff,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { ROLES } = require('../utils/constants');

// Analytics Statistics (Admin & Staff)
router.get(
  '/statistics',
  protect,
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getStatistics
);

// All Complaints (Admin & Staff)
router.get(
  '/complaints',
  protect,
  authorize(ROLES.ADMIN, ROLES.STAFF),
  getAllComplaints
);

// Assignment (Admin Only)
router.patch(
  '/complaints/:id/assign',
  protect,
  authorize(ROLES.ADMIN),
  assignDepartmentAndStaff
);

// Status Update (Admin & Staff)
router.patch(
  '/complaints/:id/status',
  protect,
  authorize(ROLES.ADMIN, ROLES.STAFF),
  updateComplaintStatus
);

// Priority Update (Admin Only)
router.patch(
  '/complaints/:id/priority',
  protect,
  authorize(ROLES.ADMIN),
  updateComplaintPriority
);

// Resolve Complaint with Evidence (Admin & Staff)
router.patch(
  '/complaints/:id/resolve',
  protect,
  authorize(ROLES.ADMIN, ROLES.STAFF),
  upload.array('evidence', 5),
  resolveComplaint
);

// Staff Account Management (Admin Only)
router.get('/staff', protect, authorize(ROLES.ADMIN), getAllStaff);
router.post('/staff', protect, authorize(ROLES.ADMIN), createStaff);
router.put('/staff/:id', protect, authorize(ROLES.ADMIN), updateStaff);

module.exports = router;
