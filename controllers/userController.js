const User = require('../models/User');
const Role = require('../models/Role');

// List of valid roles for validation
const validRoles = [
  'super_admin', 
  'operations_manager', 
  'field_refill_agent', 
  'maintenance_lead', 
  'finance_team', 
  'support_agent', 
  'warehouse_manager', 
  'auditor'
];

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
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

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
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

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, assignedRegions, assignedMachines } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Validate role
    const userRole = role || 'field_refill_agent';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`
      });
    }

    // Check if role exists in database
    const roleExists = await Role.findOne({ name: userRole });
    if (!roleExists) {
      return res.status(400).json({
        success: false,
        message: `Role '${userRole}' not found in database. Please contact administrator.`
      });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      assignedRegions: assignedRegions || [],
      assignedMachines: assignedMachines || []
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedRegions: user.assignedRegions,
        assignedMachines: user.assignedMachines,
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

const updateUser = async (req, res) => {
  try {
    const { name, email, role, assignedRegions, assignedMachines, isActive } = req.body;

    // Check if user exists
    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if email is being updated and if it already exists
    if (email && email !== existingUser.email) {
      const userWithEmail = await User.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: req.params.id } 
      });
      if (userWithEmail) {
        return res.status(400).json({ 
          success: false,
          message: 'User with this email already exists' 
        });
      }
    }

    // Validate role if provided
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles are: ${validRoles.join(', ')}`
      });
    }

    // Check if role exists in database
    if (role) {
      const roleExists = await Role.findOne({ name: role });
      if (!roleExists) {
        return res.status(400).json({
          success: false,
          message: `Role '${role}' not found in database. Please contact administrator.`
        });
      }
    }

    const updateData = {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(role && { role }),
      ...(assignedRegions && { assignedRegions }),
      ...(assignedMachines && { assignedMachines }),
      ...(isActive !== undefined && { isActive })
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating user', 
      error: error.message 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'User deleted successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};

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
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
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

// Get available roles
const getAvailableRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).select('name description');
    
    res.json({
      success: true,
      data: roles,
      count: roles.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching roles', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserPermissions,
  getAvailableRoles
};