const express = require('express');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserPermissions,
  getAvailableRoles
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get available roles (public info)
router.get('/roles/available', getAvailableRoles);

// Super Admin and Operations Manager can access user management
router.get('/', checkPermission('users', 'read'), getAllUsers);
router.get('/:id', checkPermission('users', 'read'), getUserById);
router.post('/', checkPermission('users', 'create'), createUser);
router.put('/:id', checkPermission('users', 'update'), updateUser);
router.delete('/:id', checkPermission('users', 'delete'), deleteUser);
router.get('/:id/permissions', checkPermission('users', 'read'), getUserPermissions);

module.exports = router;