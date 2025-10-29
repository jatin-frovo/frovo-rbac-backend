const Department = require('../models/Department');
const User = require('../models/User');
const Role = require('../models/Role');

// Create department
const createDepartment = async (req, res) => {
  try {
    const { name, description, roles = [] } = req.body;

    // Check if department already exists
    const existingDept = await Department.findOne({ 
      name: name.trim() 
    });
    
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Validate roles exist
    if (roles.length > 0) {
      const validRoles = await Role.find({ 
        _id: { $in: roles },
        isActive: true 
      });
      
      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more roles are invalid'
        });
      }
    }

    const department = new Department({
      name: name.trim(),
      description: description?.trim(),
      roles,
      users: [],
      createdBy: req.user.id
    });

    await department.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'create_department',
      resource: 'departments',
      resourceId: department._id,
      newState: department
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: await department.populate('roles', 'name description')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating department',
      error: error.message
    });
  }
};

// Get all departments
const getDepartments = async (req, res) => {
  try {
    const { includeUsers, includeRoles } = req.query;
    
    let populateFields = [];
    if (includeUsers === 'true') populateFields.push('users');
    if (includeRoles === 'true') populateFields.push('roles');

    const departments = await Department.find({ isActive: true })
      .populate(populateFields)
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

// Get department by ID
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('roles', 'name description permissions')
      .populate('users', 'name email role')
      .populate('createdBy', 'name email');

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

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { name, description, roles, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const previousState = { ...department.toObject() };

    // Update fields
    if (name) department.name = name.trim();
    if (description) department.description = description.trim();
    if (roles) {
      // Validate roles
      const validRoles = await Role.find({ 
        _id: { $in: roles },
        isActive: true 
      });
      
      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more roles are invalid'
        });
      }
      department.roles = roles;
    }
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    // Audit log
    await require('../models/AuditLog').create({
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
      data: await department.populate('roles', 'name description')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating department',
      error: error.message
    });
  }
};

// Assign user to department
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

    // Update user's department reference
    user.department = department._id;
    await user.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'assign_user_department',
      resource: 'departments',
      resourceId: department._id,
      newState: { assignedUser: userId, department: department._id }
    });

    res.json({
      success: true,
      message: 'User assigned to department successfully',
      data: await department.populate('users', 'name email role')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning user to department',
      error: error.message
    });
  }
};

// Remove user from department
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

    // Remove department reference from user
    await User.findByIdAndUpdate(userId, { department: null });

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'remove_user_department',
      resource: 'departments',
      resourceId: department._id,
      newState: { removedUser: userId }
    });

    res.json({
      success: true,
      message: 'User removed from department successfully',
      data: await department.populate('users', 'name email role')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing user from department',
      error: error.message
    });
  }
};

// Get department users
const getDepartmentUsers = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('users', 'name email role phone isActive');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department.users,
      count: department.users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching department users',
      error: error.message
    });
  }
};

// Delete department (soft delete)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has users
    if (department.users.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. It has ${department.users.length} user(s) assigned.`
      });
    }

    // Soft delete
    department.isActive = false;
    await department.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'delete_department',
      resource: 'departments',
      resourceId: department._id,
      newState: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting department',
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
  removeUserFromDepartment,
  getDepartmentUsers,
  deleteDepartment
};