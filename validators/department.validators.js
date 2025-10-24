const { body, param } = require('express-validator');

const createDepartmentValidator = [
  body('name')
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Department name must be between 2 and 50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim(),
  body('roles')
    .optional()
    .isArray()
    .withMessage('Roles must be an array'),
  body('users')
    .optional()
    .isArray()
    .withMessage('Users must be an array')
];

const departmentIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID')
];

const updateDepartmentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department name must be between 2 and 50 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const assignUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
];

module.exports = {
  createDepartmentValidator,
  departmentIdValidator,
  updateDepartmentValidator,
  assignUserValidator
};