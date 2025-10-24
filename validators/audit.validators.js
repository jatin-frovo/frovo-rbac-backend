const { param, query } = require('express-validator');

const auditLogIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid audit log ID')
];

const auditQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('action')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Action must be less than 50 characters')
    .trim(),
  query('resource')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Resource must be less than 50 characters')
    .trim(),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date')
];

module.exports = {
  auditLogIdValidator,
  auditQueryValidator
};