const Role = require('../models/Role');

const predefinedRoles = [
  'super_admin', 'operations_manager', 'field_refill_agent', 
  'maintenance_lead', 'finance_team', 'support_agent', 
  'warehouse_manager', 'auditor', 'customer'
];

// Get all roles including custom ones
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true })
      .select('name description permissions systemInterface isSystem isActive');
    
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

// Create custom role
const createCustomRole = async (req, res) => {
  try {
    const { name, description, permissions = [], systemInterface = ['admin_panel'] } = req.body;

    // Validate role name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }

    // Check if role already exists
    const existingRole = await Role.findOne({ 
      name: name.toLowerCase().trim() 
    });
    
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }

    const role = new Role({
      name: name.toLowerCase().trim(),
      description: description?.trim() || `Custom role: ${name}`,
      permissions,
      systemInterface,
      isSystem: predefinedRoles.includes(name.toLowerCase()),
      isActive: true
    });

    await role.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'create_custom_role',
      resource: 'roles',
      resourceId: role._id,
      newState: role
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message
    });
  }
};

// Update role permissions
const updateRolePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Store previous state for audit
    const previousState = {
      permissions: role.permissions
    };

    role.permissions = permissions || [];
    await role.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'update_role_permissions',
      resource: 'roles',
      resourceId: role._id,
      previousState,
      newState: { permissions: role.permissions }
    });

    res.json({
      success: true,
      message: 'Role permissions updated successfully',
      data: {
        id: role._id,
        name: role.name,
        permissions: role.permissions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating role permissions',
      error: error.message
    });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message
    });
  }
};

// Delete role (soft delete)
const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'System roles cannot be deleted'
      });
    }

    // Check if role is assigned to any users
    const User = require('../models/User');
    const usersWithRole = await User.countDocuments({ 
      role: role.name,
      isActive: true 
    });

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. It is assigned to ${usersWithRole} user(s).`
      });
    }

    // Soft delete
    role.isActive = false;
    await role.save();

    // Audit log
    await require('../models/AuditLog').create({
      userId: req.user.id,
      action: 'delete_role',
      resource: 'roles',
      resourceId: role._id,
      newState: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message
    });
  }
};

// Get available permissions template
const getPermissionsTemplate = async (req, res) => {
  try {
    const resources = [
      'users', 'machines', 'planograms', 'refills', 'maintenance', 
      'finance', 'support', 'inventory', 'audit', 'reports',
      'products', 'orders', 'departments', 'partners', 'security', 'access_requests'
    ];

    const actions = ['create', 'read', 'update', 'delete', 'manage', 'assign', 'approve'];

    res.json({
      success: true,
      data: {
        resources,
        actions,
        template: resources.map(resource => ({
          resource,
          actions: []
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions template',
      error: error.message
    });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { description, systemInterface } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        ...(description && { description }),
        ...(systemInterface && { systemInterface })
      },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating role', 
      error: error.message 
    });
  }
};

// Get role permissions
const getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ 
        success: false,
        message: 'Role not found' 
      });
    }

    res.json({
      success: true,
      data: {
        role: role.name,
        permissions: role.permissions,
        systemInterface: role.systemInterface
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching role permissions', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllRoles,
  createCustomRole,
  updateRolePermissions,
  updateRole,
  getRoleById,
  deleteRole,
  getPermissionsTemplate,
  getRolePermissions
};