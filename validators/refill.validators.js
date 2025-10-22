const { body, param } = require('express-validator');

const createRefillJobValidator = [
  body('machineId')
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('assignedAgent')
    .isMongoId()
    .withMessage('Invalid assigned agent ID'),
  
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product must be specified'),
  
  body('products.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('products.*.requiredQuantity')
    .isInt({ min: 1 })
    .withMessage('Required quantity must be at least 1'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateRefillJobValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid refill job ID'),
  
  body('status')
    .optional()
    .isIn(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('completedProducts')
    .optional()
    .isArray()
    .withMessage('Completed products must be an array'),
  
  body('completedProducts.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('completedProducts.*.newQuantity')
    .isInt({ min: 0 })
    .withMessage('New quantity must be a non-negative integer'),
  
  body('completedProducts.*.capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  
  body('cashCollected')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cash collected must be a positive number')
];

const refillJobIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid refill job ID')
];

module.exports = {
  createRefillJobValidator,
  updateRefillJobValidator,
  refillJobIdValidator
};