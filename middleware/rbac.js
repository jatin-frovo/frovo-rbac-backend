const Role = require('../models/Role');

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      const role = await Role.findOne({ name: userRole });
      
      if (!role) {
        return res.status(403).json({ message: 'Role not found' });
      }

      const permission = role.permissions.find(p => 
        p.resource === resource && p.actions.includes(action)
      );

      if (!permission) {
        return res.status(403).json({ 
          message: `Access denied. Required permission: ${action} on ${resource}` 
        });
      }

      // Apply conditions if any
      if (permission.conditions) {
        req.permissionConditions = permission.conditions;
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Permission check failed', error: error.message });
    }
  };
};

// Special middleware for field agents (can only access assigned machines)
const checkAssignedMachine = async (req, res, next) => {
  if (req.user.role === 'field_refill_agent' || req.user.role === 'maintenance_lead') {
    const machineId = req.params.machineId || req.body.machineId;
    
    if (machineId && !req.user.assignedMachines.includes(machineId)) {
      return res.status(403).json({ message: 'Access denied to this machine' });
    }
  }
  next();
};

module.exports = { checkPermission, checkAssignedMachine };