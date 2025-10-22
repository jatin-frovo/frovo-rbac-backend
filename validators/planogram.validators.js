const { body, param } = require('express-validator');

const createPlanogramValidator = [
  body('machineId')
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Planogram name must be between 2-100 characters'),
  
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product must be defined'),
  
  body('products.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('products.*.slot')
    .isLength({ min: 1, max: 10 })
    .withMessage('Slot must be between 1-10 characters'),
  
  body('products.*.maxCapacity')
    .isInt({ min: 1 })
    .withMessage('Max capacity must be at least 1'),
  
  body('products.*.currentStock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current stock must be a non-negative integer'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updatePlanogramValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid planogram ID'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Planogram name must be between 2-100 characters'),
  
  body('products')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Products must be an array with at least one product'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const planogramIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid planogram ID')
];

module.exports = {
  createPlanogramValidator,
  updatePlanogramValidator,
  planogramIdValidator
};