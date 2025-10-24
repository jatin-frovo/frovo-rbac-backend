const { body, param, query } = require('express-validator');

const createAccessRequestValidator = [
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
    .trim(),
  body('role')
    .optional()
    .isMongoId()
    .withMessage('Invalid role ID'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  body('duration.start')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date'),
  body('duration.end')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (req.body.duration?.start && value <= req.body.duration.start) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

const accessRequestIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid access request ID')
];

const accessRequestQueryValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'expired'])
    .withMessage('Invalid status'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID')
];

const approveRejectValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid access request ID'),
  body('comments')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comments must be less than 500 characters')
    .trim()
];

module.exports = {
  createAccessRequestValidator,
  accessRequestIdValidator,
  accessRequestQueryValidator,
  approveRejectValidator
};