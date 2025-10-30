const Department = require('../models/Department');
const User = require('../models/User');
const Role = require('../models/Role');

// Create department
const createDepartment = async (req, res) => {
  try {
    const { name, description, roles = [] } = req.body;

    // Check if department already exists - NO ERROR, just return existing department
    const existingDept = await Department.findOne({ 
      name: name.trim() 
    }).populate('roles', 'name description');
    
    if (existingDept) {
      return res.json({
        success: true,
        message: 'Department already exists',
        data: existingDept
      });
    }

    // Validate roles exist by NAME instead of ID
    if (roles.length > 0) {
      const validRoles = await Role.find({ 
        name: { $in: roles },
        isActive: true 
      });
      
      if (validRoles.length !== roles.length) {
        const invalidRoles = roles.filter(roleName => 
          !validRoles.some(validRole => validRole.name === roleName)
        );
        
        return res.status(400).json({
          success: false,
          message: 'One or more roles are invalid',
          invalidRoles: invalidRoles
        });
      }

      // Get role IDs for saving to department
      const roleIds = validRoles.map(role => role._id);
      
      const department = new Department({
        name: name.trim(),
        description: description?.trim(),
        roles: roleIds, // Store role IDs in database
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
    } else {
      // No roles provided, create department without roles
      const department = new Department({
        name: name.trim(),
        description: description?.trim(),
        roles: [],
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
    }
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
    
    // Handle roles by NAME
    if (roles) {
      // Validate roles by name
      const validRoles = await Role.find({ 
        name: { $in: roles },
        isActive: true 
      });
      
      if (validRoles.length !== roles.length) {
        const invalidRoles = roles.filter(roleName => 
          !validRoles.some(validRole => validRole.name === roleName)
        );
        
        return res.status(400).json({
          success: false,
          message: 'One or more roles are invalid',
          invalidRoles: invalidRoles
        });
      }
      
      // Convert role names to IDs for storage
      department.roles = validRoles.map(role => role._id);
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

// Add roles to department by NAME
const addRolesToDepartment = async (req, res) => {
  try {
    const { roles } = req.body;

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Roles array is required and cannot be empty'
      });
    }

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Validate roles exist by NAME and are active
    const validRoles = await Role.find({ 
      name: { $in: roles },
      isActive: true 
    });
    
    if (validRoles.length !== roles.length) {
      const invalidRoles = roles.filter(roleName => 
        !validRoles.some(validRole => validRole.name === roleName)
      );
      
      return res.status(400).json({
        success: false,
        message: 'One or more roles are invalid or inactive',
        invalidRoles: invalidRoles
      });
    }

    const previousRoles = [...department.roles];
    const validRoleIds = validRoles.map(role => role._id);

    // Add new roles (avoid duplicates)
    const newRoles = [...new Set([...department.roles.map(id => id.toString()), ...validRoleIds.map(id => id.toString())])];
    
    // Check if any roles were actually added
    if (newRoles.length === department.roles.length) {
      return res.status(400).json({
        success: false,
        message: 'All specified roles are already assigned to this department'
      });
    }

    department.roles = newRoles;
    await department.save();

    // Get the newly added roles for audit log
    const addedRoles = validRoles.filter(role => 
      !previousRoles.some(prevRoleId => prevRoleId.toString() === role._id.toString())
    );

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'add_roles_department',
      resource: 'departments',
      resourceId: department._id,
      previousState: { roles: previousRoles },
      newState: { 
        roles: department.roles,
        addedRoles: addedRoles.map(role => role.name)
      }
    });

    res.json({
      success: true,
      message: `Successfully added ${addedRoles.length} role(s) to department`,
      data: {
        department: await department.populate('roles', 'name description'),
        addedRoles: addedRoles.map(role => ({ name: role.name, description: role.description }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding roles to department',
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
  addRolesToDepartment,
  assignUserToDepartment,
  removeUserFromDepartment,
  getDepartmentUsers,
  deleteDepartment
};