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
        actions: ['create', 'read', 'update', 'delete', 'manage','assign']
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
      }
    ]
  },

  field_refill_agent: {
    description: 'On-ground staff handling machine refills',
    systemInterface: ['field_app'],
    permissions: [
      {
        resource: 'refills',
        actions: ['read', 'update'],
        conditions: { assignedOnly: true }
      },
      {
        resource: 'machines',
        actions: ['read'],
        conditions: { assignedOnly: true }
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
        actions: ['read'],
        conditions: { assignedOnly: true }
      },
      {
        resource: 'reports',
        actions: ['read'],
        conditions: { revenueOnly: true }
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
        resource: 'refunds',
        actions: ['create', 'read', 'update']
      },
      {
        resource: 'users',
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
      }
    ]
  },

  // ✅ ADD CUSTOMER ROLE RIGHT HERE - AFTER AUDITOR AND BEFORE THE CLOSING BRACE
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
  // Make sure there's no comma after the customer role if it's the last one
};

module.exports = rolesConfig;