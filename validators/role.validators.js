const { body, param } = require('express-validator');

const roleIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID')
];

const updateRoleValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),
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
    .withMessage('System interface must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

module.exports = {
  roleIdValidator,
  updateRoleValidator
};