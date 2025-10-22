const { param, query } = require('express-validator');

const auditLogIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid audit log ID')
];

const auditQueryValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('action')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Action filter cannot be empty'),
  
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  query('resource')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Resource filter cannot be empty'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1-100')
];

module.exports = {
  auditLogIdValidator,
  auditQueryValidator
};