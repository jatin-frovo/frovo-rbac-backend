const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    enum: [
      'users', 'roles', 'machines', 'planograms', 'refills', 'maintenance', 
      'finance', 'support', 'inventory', 'audit', 'reports',
      'catalogue', 'alerts', 'stock', 'payouts', 'settlements', 'dispatch',
      'products', 'orders', 'payments', 'profile', 'transactions',
      'departments', 'partners', 'security', 'access_requests'
    ]
  },
  actions: [{
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'manage', 'assign', 'approve']
  }],
  conditions: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
});

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Allow predefined roles AND custom roles that match the pattern
        const predefinedRoles = [
          'super_admin', 'operations_manager', 'field_refill_agent', 
          'maintenance_lead', 'finance_team', 'support_agent', 
          'warehouse_manager', 'auditor', 'customer'
        ];
        
        // If it's a predefined role, allow it
        if (predefinedRoles.includes(v)) {
          return true;
        }
        
        // If it's a custom role, validate the pattern
        return /^[a-z_]+$/.test(v);
      },
      message: 'Role name must be either a predefined role or contain only lowercase letters and underscores'
    }
  },
  description: {
    type: String,
    required: true
  },
  permissions: [permissionSchema],
  systemInterface: [{
    type: String,
    enum: ['admin_panel', 'mobile_app', 'field_app', 'technician_app', 'finance_dashboard', 'support_dashboard', 'warehouse_portal', 'web_portal']
  }],
  scope: {
    type: String,
    enum: ['global', 'partner', 'region', 'machine'],
    default: 'global'
  },
  assignedEntities: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'scope'
  }],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);