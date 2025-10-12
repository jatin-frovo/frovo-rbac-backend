const express = require('express');
const {
  getAllRoles,
  getRoleById,
  updateRole,
  getRolePermissions
} = require('../controllers/roleController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Only Super Admin can manage roles
router.get('/', checkPermission('roles', 'read'), getAllRoles);
router.get('/:id', checkPermission('roles', 'read'), getRoleById);
router.put('/:id', checkPermission('roles', 'update'), updateRole);
router.get('/:id/permissions', checkPermission('roles', 'read'), getRolePermissions);

module.exports = router;