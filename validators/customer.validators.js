const { body, param, query } = require('express-validator');

const createOrderValidator = [
  body('machineId')
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('customerId')
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product must be ordered'),
  
  body('products.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('products.*.quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1-10'),
  
  body('paymentMethod')
    .isIn(['cash', 'card', 'digital_wallet', 'upi'])
    .withMessage('Invalid payment method'),
  
  body('totalAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Total amount must be a positive number')
];

const orderIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID')
];

const customerQueryValidator = [
  query('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  query('machineId')
    .optional()
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

module.exports = {
  createOrderValidator,
  orderIdValidator,
  customerQueryValidator
};