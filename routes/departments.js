const express = require('express');
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  assignUserToDepartment,
  removeUserFromDepartment
} = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  createDepartmentValidator,
  departmentIdValidator,
  updateDepartmentValidator,
  assignUserValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

router.use(auth);

router.post('/', checkPermission('departments', 'create'), createDepartmentValidator, handleValidationErrors, createDepartment);
router.get('/', checkPermission('departments', 'read'), getDepartments);
router.get('/:id', departmentIdValidator, handleValidationErrors, checkPermission('departments', 'read'), getDepartmentById);
router.put('/:id', departmentIdValidator, handleValidationErrors, updateDepartmentValidator, handleValidationErrors, checkPermission('departments', 'update'), updateDepartment);
router.post('/:id/assign-user', departmentIdValidator, handleValidationErrors, assignUserValidator, handleValidationErrors, checkPermission('departments', 'update'), assignUserToDepartment);
router.post('/:id/remove-user', departmentIdValidator, handleValidationErrors, assignUserValidator, handleValidationErrors, checkPermission('departments', 'update'), removeUserFromDepartment);

module.exports = router;