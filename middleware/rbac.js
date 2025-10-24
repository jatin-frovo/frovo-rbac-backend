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

// Scope-based access control
const checkScope = (requiredScope) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user.role;
      const role = await Role.findOne({ name: userRole });
      
      if (!role) {
        return res.status(403).json({ message: 'Role not found' });
      }

      // Super admin has global scope
      if (userRole === 'super_admin') {
        return next();
      }

      // Check if user's role scope matches required scope
      if (role.scope !== requiredScope && role.scope !== 'global') {
        return res.status(403).json({ 
          message: `Access denied. Required scope: ${requiredScope}, your scope: ${role.scope}` 
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Scope check failed', error: error.message });
    }
  };
};

// IP Allowlist middleware
const checkIPAllowlist = async (req, res, next) => {
  try {
    const SecuritySettings = require('../models/SecuritySettings');
    const settings = await SecuritySettings.getSettings();
    
    if (settings && settings.ipAllowlist && settings.ipAllowlist.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      const allowedIPs = settings.ipAllowlist
        .filter(ip => ip.isActive)
        .map(ip => ip.ip);

      // Simple IP matching (for production, use proper IP range checking)
      const isAllowed = allowedIPs.some(allowedIP => {
        if (allowedIP.includes('/')) {
          // CIDR notation - implement proper CIDR check in production
          return clientIP.startsWith(allowedIP.split('/')[0]);
        }
        return clientIP === allowedIP;
      });

      if (!isAllowed) {
        return res.status(403).json({ 
          message: 'Access denied from this IP address' 
        });
      }
    }

    next();
  } catch (error) {
    // If IP check fails, allow access (fail-open for availability)
    console.error('IP allowlist check failed:', error);
    next();
  }
};

module.exports = { 
  checkPermission, 
  checkAssignedMachine, 
  checkScope,
  checkIPAllowlist 
};