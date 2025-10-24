const Department = require('../models/Department');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const createDepartment = async (req, res) => {
  try {
    const { name, description, roles, users } = req.body;

    // Check if department already exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    const department = new Department({
      name,
      description,
      roles: roles || [],
      users: users || [],
      createdBy: req.user.id
    });

    await department.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_department',
      resource: 'departments',
      resourceId: department._id,
      newState: department
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: await department.populate(['roles', 'users', 'createdBy'])
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

const getDepartments = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const departments = await Department.find(query)
      .populate('roles', 'name description')
      .populate('users', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching departments',
      error: error.message
    });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('roles')
      .populate('users')
      .populate('createdBy');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching department',
      error: error.message
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { name, description, roles, users, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const previousState = { ...department.toObject() };

    // Update fields
    if (name) department.name = name;
    if (description) department.description = description;
    if (roles) department.roles = roles;
    if (users) department.users = users;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'update_department',
      resource: 'departments',
      resourceId: department._id,
      previousState,
      newState: department
    });

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: await department.populate(['roles', 'users'])
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

const assignUserToDepartment = async (req, res) => {
  try {
    const { userId } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already in department
    if (department.users.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User already in this department'
      });
    }

    department.users.push(userId);
    await department.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'assign_user_department',
      resource: 'departments',
      resourceId: department._id,
      newState: { assignedUser: userId }
    });

    res.json({
      success: true,
      message: 'User assigned to department successfully',
      data: await department.populate('users')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning user to department',
      error: error.message
    });
  }
};

// Add this missing function
const removeUserFromDepartment = async (req, res) => {
  try {
    const { userId } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if user is in department
    if (!department.users.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User not in this department'
      });
    }

    department.users = department.users.filter(id => id.toString() !== userId);
    await department.save();

    // Log the action
    await AuditLog.create({
      userId: req.user.id,
      action: 'remove_user_department',
      resource: 'departments',
      resourceId: department._id,
      newState: { removedUser: userId }
    });

    res.json({
      success: true,
      message: 'User removed from department successfully',
      data: await department.populate('users')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing user from department',
      error: error.message
    });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  assignUserToDepartment,
  removeUserFromDepartment
};