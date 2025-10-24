const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

// Complete roles configuration with valid resource names
const rolesConfig = {
  super_admin: {
    description: 'Platform owner with complete control',
    systemInterface: ['admin_panel'],
    permissions: [
      {
        resource: 'users',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'roles',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'machines',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'planograms',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'refills',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'maintenance',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'finance',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'support',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'inventory',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'audit',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'reports',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'products',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'orders',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      // ✅ ADDED NEW RESOURCES FOR SUPER ADMIN
      {
        resource: 'departments',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'partners',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'security',
        actions: ['create', 'read', 'update', 'delete', 'manage']
      },
      {
        resource: 'access_requests',
        actions: ['create', 'read', 'update', 'delete', 'manage', 'approve']
      }
    ]
  },
  operations_manager: {
    description: 'Oversees daily machine operations across regions',
    systemInterface: ['admin_panel'],
    permissions: [
      {
        resource: 'machines',
        actions: ['read', 'update', 'manage']
      },
      {
        resource: 'planograms',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'refills',
        actions: ['create', 'read', 'update', 'assign', 'manage']
      },
      {
        resource: 'catalogue',
        actions: ['read', 'assign']
      },
      {
        resource: 'alerts',
        actions: ['read', 'update', 'manage']
      },
      {
        resource: 'users',
        actions: ['read', 'update']
      },
      {
        resource: 'products',
        actions: ['read', 'update']
      },
      {
        resource: 'orders',
        actions: ['read']
      }
    ]
  },
  field_refill_agent: {
    description: 'On-ground staff handling machine refills',
    systemInterface: ['field_app'],
    permissions: [
      {
        resource: 'refills',
        actions: ['read', 'update']
      },
      {
        resource: 'machines',
        actions: ['read']
      },
      {
        resource: 'stock',
        actions: ['read', 'update']
      }
    ]
  },
  maintenance_lead: {
    description: 'Manages machine servicing and maintenance',
    systemInterface: ['admin_panel', 'technician_app'],
    permissions: [
      {
        resource: 'maintenance',
        actions: ['create', 'read', 'update', 'manage', 'assign']
      },
      {
        resource: 'machines',
        actions: ['read']
      },
      {
        resource: 'reports',
        actions: ['read']
      }
    ]
  },
  finance_team: {
    description: 'Handles all monetary and accounting tasks',
    systemInterface: ['finance_dashboard'],
    permissions: [
      {
        resource: 'finance',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'payouts',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'settlements',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'reports',
        actions: ['read']
      },
      {
        resource: 'transactions',
        actions: ['read', 'manage']
      }
    ]
  },
  support_agent: {
    description: 'Resolves customer queries and escalations',
    systemInterface: ['support_dashboard'],
    permissions: [
      {
        resource: 'support',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'users',
        actions: ['read']
      },
      {
        resource: 'orders',
        actions: ['read']
      },
      {
        resource: 'transactions',
        actions: ['read']
      }
    ]
  },
  warehouse_manager: {
    description: 'Handles stock and warehouse operations',
    systemInterface: ['warehouse_portal'],
    permissions: [
      {
        resource: 'inventory',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'stock',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'dispatch',
        actions: ['create', 'read', 'update', 'manage']
      },
      {
        resource: 'products',
        actions: ['create', 'read', 'update', 'manage']
      }
    ]
  },
  auditor: {
    description: 'Ensures compliance and data accuracy',
    systemInterface: ['admin_panel'],
    permissions: [
      {
        resource: 'audit',
        actions: ['read']
      },
      {
        resource: 'reports',
        actions: ['read']
      },
      {
        resource: 'finance',
        actions: ['read']
      },
      {
        resource: 'transactions',
        actions: ['read']
      }
    ]
  },
  // ✅ ADDED CUSTOMER ROLE
  customer: {
    description: 'End customer who buys products from vending machines',
    systemInterface: ['mobile_app', 'web_portal'],
    permissions: [
      {
        resource: 'products',
        actions: ['read']
      },
      {
        resource: 'machines',
        actions: ['read']
      },
      {
        resource: 'transactions',
        actions: ['create', 'read']
      },
      {
        resource: 'orders',
        actions: ['create', 'read', 'update']
      },
      {
        resource: 'payments',
        actions: ['create', 'read']
      },
      {
        resource: 'profile',
        actions: ['read', 'update']
      }
    ]
  }
};

// Initialize roles in database
const initializeRoles = async () => {
  try {
    console.log('Starting role initialization...');
    
    // Clear existing roles to avoid conflicts
    await Role.deleteMany({});
    console.log('Cleared existing roles');
    
    for (const [roleName, roleConfig] of Object.entries(rolesConfig)) {
      console.log(`Creating role ${roleName}...`);
      
      // Validate permissions before saving
      const validPermissions = roleConfig.permissions.filter(permission => {
        const validResources = [
          'users', 'machines', 'planograms', 'refills', 'maintenance', 
          'finance', 'support', 'inventory', 'audit', 'reports',
          'catalogue', 'alerts', 'stock', 'payouts', 'settlements', 'dispatch',
          'products', 'orders', 'payments', 'profile', 'transactions',
          // ✅ ADDED NEW RESOURCES
          'departments', 'partners', 'security', 'access_requests'
        ];
        
        if (!validResources.includes(permission.resource)) {
          console.warn(`Skipping invalid resource: ${permission.resource} for role ${roleName}`);
          return false;
        }
        return true;
      });

      const role = new Role({
        name: roleName,
        description: roleConfig.description,
        permissions: validPermissions,
        systemInterface: roleConfig.systemInterface
      });
      
      await role.save();
      console.log(`✓ Role ${roleName} created successfully`);
    }
    
    console.log('Role initialization completed successfully');
    
    // Verify all roles were created
    const allRoles = await Role.find();
    console.log(`Total roles in database: ${allRoles.length}`);
    allRoles.forEach(role => {
      console.log(`- ${role.name}: ${role.description}`);
    });
    
  } catch (error) {
    console.error('Error initializing roles:', error.message);
    console.error('Full error:', error);
  }
};

// Add this function to reinitialize roles
const reinitializeRoles = async (req, res) => {
  try {
    await initializeRoles();
    res.json({
      success: true,
      message: 'Roles reinitialized successfully with updated permissions'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reinitializing roles',
      error: error.message
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ FIX: Set default role to 'customer' if not provided or invalid
    let userRole = role || 'customer';
    
    // Verify role exists
    const roleExists = await Role.findOne({ name: userRole });
    if (!roleExists) {
      // If role doesn't exist, default to customer
      userRole = 'customer';
      console.log(`Role ${role} not found, defaulting to customer`);
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      role: userRole
    });

    await user.save();

    // Create JWT token
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create JWT token
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const role = await Role.findOne({ name: user.role });
    
    res.json({
      user: {
        ...user.toObject(),
        permissions: role?.permissions || [],
        systemInterface: role?.systemInterface || []
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ADD THIS FUNCTION
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  initializeRoles, 
  changePassword,
  reinitializeRoles 
};