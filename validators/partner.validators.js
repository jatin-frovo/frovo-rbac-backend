const { body, param } = require('express-validator');

const createPartnerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Partner name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Partner name must be between 2 and 50 characters')
    .trim(),
  body('code')
    .notEmpty()
    .withMessage('Partner code is required')
    .isLength({ min: 2, max: 10 })
    .withMessage('Partner code must be between 2 and 10 characters')
    .isUppercase()
    .withMessage('Partner code must be uppercase')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description must be less than 200 characters')
    .trim(),
  body('contact.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('contact.phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Invalid phone number'),
  body('settings.commissionRate')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Commission rate must be between 0 and 1'),
  body('settings.payoutFrequency')
    .optional()
    .isIn(['weekly', 'bi-weekly', 'monthly'])
    .withMessage('Invalid payout frequency')
];

const partnerIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid partner ID')
];

const assignMachineValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid partner ID'),
  body('machineId')
    .isMongoId()
    .withMessage('Invalid machine ID')
];

const partnerQueryValidator = [
  param('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

module.exports = {
  createPartnerValidator,
  partnerIdValidator,
  assignMachineValidator,
  partnerQueryValidator
};