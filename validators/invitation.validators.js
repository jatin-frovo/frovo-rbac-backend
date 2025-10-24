const { body, param } = require('express-validator');

const createInvitationValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('role')
    .isMongoId()
    .withMessage('Valid role ID is required'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('partner')
    .optional()
    .isMongoId()
    .withMessage('Invalid partner ID'),
  body('customMessage')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Custom message must be less than 500 characters')
    .trim()
];

const invitationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid invitation ID')
];

const acceptInvitationValidator = [
  body('token')
    .notEmpty()
    .withMessage('Invitation token is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid token format'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const invitationQueryValidator = [
  param('status')
    .optional()
    .isIn(['pending', 'accepted', 'expired', 'cancelled'])
    .withMessage('Invalid status')
];

module.exports = {
  createInvitationValidator,
  invitationIdValidator,
  acceptInvitationValidator,
  invitationQueryValidator
};