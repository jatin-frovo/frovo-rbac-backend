const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllRoles,
  createCustomRole,
  updateRolePermissions,
  getRoleById,
  deleteRole,
  getPermissionsTemplate
} = require('../controllers/roleController');

// Import middleware
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

// Import validators
const { 
  createRoleValidator,
  roleIdValidator,
  updatePermissionsValidator,
  handleValidationErrors 
} = require('../validators');

// Apply auth middleware to all routes
router.use(auth);

// Route definitions
router.get('/', checkPermission('roles', 'read'), getAllRoles);

router.post('/custom', 
  checkPermission('roles', 'create'), 
  createRoleValidator, 
  handleValidationErrors, 
  createCustomRole
);

router.get('/permissions-template', 
  checkPermission('roles', 'read'), 
  getPermissionsTemplate
);

router.get('/:id', 
  checkPermission('roles', 'read'), 
  roleIdValidator, 
  handleValidationErrors, 
  getRoleById
);

router.put('/:id/permissions', 
  checkPermission('roles', 'update'), 
  updatePermissionsValidator, 
  handleValidationErrors, 
  updateRolePermissions
);

router.delete('/:id', 
  checkPermission('roles', 'delete'), 
  roleIdValidator, 
  handleValidationErrors, 
  deleteRole
);

module.exports = router;