const { body, param } = require('express-validator');

const createRoleValidator = [
  body('name')
    .notEmpty()
    .withMessage('Role name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z_]+$/)
    .withMessage('Role name can only contain letters and underscores')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim(),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('systemInterface')
    .optional()
    .isArray()
    .withMessage('System interface must be an array')
];

const roleIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID')
];

const updatePermissionsValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),
  body('permissions')
    .isArray()
    .withMessage('Permissions must be an array'),
  body('permissions.*.resource')
    .isIn([
      'users', 'machines', 'planograms', 'refills', 'maintenance', 
      'finance', 'support', 'inventory', 'audit', 'reports',
      'products', 'orders', 'departments', 'partners', 'security', 'access_requests'
    ])
    .withMessage('Invalid resource'),
  body('permissions.*.actions')
    .isArray()
    .withMessage('Actions must be an array'),
  body('permissions.*.actions.*')
    .isIn(['create', 'read', 'update', 'delete', 'manage', 'assign', 'approve'])
    .withMessage('Invalid action')
];

module.exports = {
  createRoleValidator,
  roleIdValidator,
  updatePermissionsValidator
};