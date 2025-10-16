const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true,
    enum: [
      'users', 
      'machines', 
      'planograms', 
      'refills', 
      'maintenance', 
      'finance', 
      'support', 
      'inventory', 
      'audit', 
      'reports',
      'catalogue',
      'alerts',
      'stock',
      'payouts',
      'settlements',
      'dispatch',
      'products',        // ✅ ADDED
      'orders',          // ✅ ADDED
      'payments',        // ✅ ADDED
      'profile',         // ✅ ADDED
      'transactions'     // ✅ ADDED
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
    enum: ['super_admin', 'operations_manager', 'field_refill_agent', 'maintenance_lead', 'finance_team', 'support_agent', 'warehouse_manager', 'auditor', 'customer']
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);