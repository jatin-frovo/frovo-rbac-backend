const { body, param, query } = require('express-validator');

const productIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID')
];

const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['beverages', 'snacks', 'chocolates', 'health', 'other'])
    .withMessage('Invalid category'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a positive integer'),
  body('sku')
    .optional()
    .isLength({ max: 50 })
    .withMessage('SKU must be less than 50 characters')
    .trim()
];

const updateStockValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a positive integer'),
  body('action')
    .isIn(['add', 'remove', 'set'])
    .withMessage('Action must be add, remove, or set'),
  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes must be less than 200 characters')
    .trim()
];

const inventoryQueryValidator = [
  query('category')
    .optional()
    .isIn(['beverages', 'snacks', 'chocolates', 'health', 'other'])
    .withMessage('Invalid category'),
  query('lowStock')
    .optional()
    .isBoolean()
    .withMessage('lowStock must be a boolean')
];

module.exports = {
  productIdValidator,
  createProductValidator,
  updateStockValidator,
  inventoryQueryValidator
};