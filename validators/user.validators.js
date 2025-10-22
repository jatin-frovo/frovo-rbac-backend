const { body, param } = require('express-validator');

const createUserValidator = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('role')
    .isIn(['super_admin', 'operations_manager', 'field_refill_agent', 'maintenance_lead', 'finance_team', 'support_agent', 'warehouse_manager', 'auditor', 'customer'])
    .withMessage('Invalid role specified'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('assignedRegions')
    .optional()
    .isArray()
    .withMessage('Assigned regions must be an array'),
  
  body('assignedRegions.*')
    .isLength({ min: 1 })
    .withMessage('Region cannot be empty'),
  
  body('assignedMachines')
    .optional()
    .isArray()
    .withMessage('Assigned machines must be an array'),
  
  body('assignedMachines.*')
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('preferredPaymentMethod')
    .optional()
    .isIn(['cash', 'card', 'digital_wallet', 'upi'])
    .withMessage('Invalid payment method'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('assignedRegions')
    .optional()
    .isArray()
    .withMessage('Assigned regions must be an array'),
  
  body('assignedMachines')
    .optional()
    .isArray()
    .withMessage('Assigned machines must be an array'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const userIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const userAgentIdValidator = [
  param('agentId')
    .isMongoId()
    .withMessage('Invalid agent ID')
];

const roleIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID')
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
  userAgentIdValidator,
  roleIdValidator
};