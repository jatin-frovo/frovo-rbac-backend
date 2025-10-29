const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');

// Create user
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone, assignedRegions, assignedMachines } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate role exists
    /*
    const roleExists = await Role.findOne({ 
      name: role,
      isActive: true 
    });
    
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
*/
    // Validate department if provided
    if (department) {
      const departmentExists = await Department.findOne({
        _id: department,
        isActive: true
      });
      
      if (!departmentExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department specified'
        });
      }
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      department: department || null,
      phone: phone?.trim(),
      assignedRegions: assignedRegions || [],
      assignedMachines: assignedMachines || []
    });

    await user.save();

    // If department is provided, add user to department
    if (department) {
      await Department.findByIdAndUpdate(
        department,
        { $addToSet: { users: user._id } }
      );
    }

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'create_user',
      resource: 'users',
      resourceId: user._id,
      newState: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { department, role, isActive } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, assignedRegions, assignedMachines } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const previousState = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      assignedRegions: user.assignedRegions,
      assignedMachines: user.assignedMachines
    };

    // Update fields if provided
    if (name) user.name = name.trim();
    if (email) {
      // Check if email already exists (excluding current user)
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      user.email = email.toLowerCase().trim();
    }
    if (phone !== undefined) user.phone = phone?.trim();
    if (assignedRegions !== undefined) user.assignedRegions = assignedRegions;
    if (assignedMachines !== undefined) user.assignedMachines = assignedMachines;

    await user.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'update_user',
      resource: 'users',
      resourceId: user._id,
      previousState,
      newState: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        assignedRegions: user.assignedRegions,
        assignedMachines: user.assignedMachines
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: await user.populate('department', 'name')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Update user role and department
const updateUserRoleAndDepartment = async (req, res) => {
  try {
    const { role, department } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const previousState = {
      role: user.role,
      department: user.department
    };

    // Validate new role if provided
    if (role) {
      const roleExists = await Role.findOne({ 
        name: role,
        isActive: true 
      });
      
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }
      user.role = role;
    }

    // Handle department change
    if (department !== undefined) {
      if (department) {
        // Validate new department
        const departmentExists = await Department.findOne({
          _id: department,
          isActive: true
        });
        
        if (!departmentExists) {
          return res.status(400).json({
            success: false,
            message: 'Invalid department specified'
          });
        }

        // Remove from old department
        if (user.department) {
          await Department.findByIdAndUpdate(
            user.department,
            { $pull: { users: user._id } }
          );
        }

        // Add to new department
        user.department = department;
        await Department.findByIdAndUpdate(
          department,
          { $addToSet: { users: user._id } }
        );
      } else {
        // Remove from department
        if (user.department) {
          await Department.findByIdAndUpdate(
            user.department,
            { $pull: { users: user._id } }
          );
        }
        user.department = null;
      }
    }

    await user.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'update_user_role_department',
      resource: 'users',
      resourceId: user._id,
      previousState,
      newState: {
        role: user.role,
        department: user.department
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: await user.populate('department', 'name')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const role = await Role.findOne({ name: user.role });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        permissions: role?.permissions || [],
        systemInterface: role?.systemInterface || []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user permissions',
      error: error.message
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'update_user_status',
      resource: 'users',
      resourceId: user._id,
      newState: { isActive }
    });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove user from department
    if (user.department) {
      await Department.findByIdAndUpdate(
        user.department,
        { $pull: { users: user._id } }
      );
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'delete_user',
      resource: 'users',
      resourceId: user._id,
      newState: { isActive: false }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRoleAndDepartment,
  getUserPermissions,
  updateUserStatus,
  deleteUser
};