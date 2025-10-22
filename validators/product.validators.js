const { body, param } = require('express-validator');

const createProductValidator = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2-100 characters'),
  
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn(['beverages', 'snacks', 'chocolates', 'health', 'other'])
    .withMessage('Invalid category'),
  
  body('sku')
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3-50 characters'),
  
  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand cannot exceed 50 characters'),
  
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  
  body('nutritionalInfo.calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  
  body('nutritionalInfo.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number')
];

const productIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

const updateStockValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
];

module.exports = {
  createProductValidator,
  productIdValidator,
  updateStockValidator
};