const Role = require('../models/Role');

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role', error: error.message });
  }
};

const updateRole = async (req, res) => {
  try {
    const { permissions, description, systemInterface } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      {
        ...(permissions && { permissions }),
        ...(description && { description }),
        ...(systemInterface && { systemInterface })
      },
      { new: true }
    );

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({
      message: 'Role updated successfully',
      role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role', error: error.message });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({
      role: role.name,
      permissions: role.permissions,
      systemInterface: role.systemInterface
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching role permissions', error: error.message });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  updateRole,
  getRolePermissions
};