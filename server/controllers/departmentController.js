const Department = require('../models/Department');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all active departments
// @route   GET /api/departments
// @access  Public / Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('staff', 'name email phone role')
      .sort({ name: 1 });

    return sendSuccess(res, 'Departments retrieved successfully', { departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate(
      'staff',
      'name email phone role'
    );

    if (!department) {
      return sendError(res, 'Department not found', 404);
    }

    return sendSuccess(res, 'Department retrieved successfully', { department });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department (Admin)
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, contactEmail, contactPhone } = req.body;

    if (!name) {
      return sendError(res, 'Department name is required', 400);
    }

    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existing) {
      return sendError(res, 'A department with this name already exists', 400);
    }

    const department = await Department.create({
      name: name.trim(),
      description: (description || '').trim(),
      contactEmail: (contactEmail || '').trim(),
      contactPhone: (contactPhone || '').trim(),
    });

    return sendSuccess(res, 'Department created successfully', { department }, 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update department (Admin)
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, contactEmail, contactPhone, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 'Department not found', 404);
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description.trim();
    if (contactEmail !== undefined) department.contactEmail = contactEmail.trim();
    if (contactPhone !== undefined) department.contactPhone = contactPhone.trim();
    if (isActive !== undefined) department.isActive = Boolean(isActive);

    await department.save();

    return sendSuccess(res, 'Department updated successfully', { department });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department (Admin)
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 'Department not found', 404);
    }

    // Soft delete
    department.isActive = false;
    await department.save();

    return sendSuccess(res, 'Department deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
