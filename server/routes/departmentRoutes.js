const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

// Public/Private department listing
router.get('/', getDepartments);
router.get('/:id', protect, getDepartmentById);

// Admin-only department CRUD
router.post('/', protect, authorize(ROLES.ADMIN), createDepartment);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateDepartment);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteDepartment);

module.exports = router;
