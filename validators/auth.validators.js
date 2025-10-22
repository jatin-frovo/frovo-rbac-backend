const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters')
    .trim(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .isIn(['super_admin', 'operations_manager', 'field_refill_agent', 'maintenance_lead', 'finance_team', 'support_agent', 'warehouse_manager', 'auditor', 'customer'])
    .withMessage('Invalid role specified'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('address.street')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters'),
  
  body('preferredPaymentMethod')
    .optional()
    .isIn(['cash', 'card', 'digital_wallet', 'upi'])
    .withMessage('Invalid payment method')
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator
};