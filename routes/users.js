const express = require('express');
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRoleAndDepartment,
  getUserPermissions,
  updateUserStatus,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

router.use(auth);

// User management routes - ALL VALIDATORS REMOVED
router.get('/', checkPermission('users', 'read'), getAllUsers);
router.post('/', checkPermission('users', 'create'), createUser);
router.get('/:id', checkPermission('users', 'read'), getUserById);
router.put('/:id', checkPermission('users', 'update'), updateUser);
router.patch('/:id/role-department', checkPermission('users', 'update'), updateUserRoleAndDepartment);
router.get('/:id/permissions', checkPermission('users', 'read'), getUserPermissions);
router.patch('/:id/status', checkPermission('users', 'update'), updateUserStatus);
router.delete('/:id', checkPermission('users', 'delete'), deleteUser);

module.exports = router;