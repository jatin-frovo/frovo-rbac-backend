const { body, param, query } = require('express-validator');

const createTransactionValidator = [
  body('machineId')
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  
  body('type')
    .isIn(['sale', 'refund', 'payout', 'purchase'])
    .withMessage('Invalid transaction type'),
  
  body('paymentMethod')
    .isIn(['cash', 'card', 'digital', 'digital_wallet', 'upi'])
    .withMessage('Invalid payment method'),
  
  body('product')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  
  body('customerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid customer ID'),
  
  body('paymentGateway')
    .optional()
    .isIn(['razorpay', 'stripe', 'paypal', 'cash', 'internal'])
    .withMessage('Invalid payment gateway')
];

const transactionIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID')
];

const financeReportValidator = [
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('type')
    .optional()
    .isIn(['sale', 'refund', 'payout', 'purchase'])
    .withMessage('Invalid transaction type filter'),
  
  query('machineId')
    .optional()
    .isMongoId()
    .withMessage('Invalid machine ID')
];

module.exports = {
  createTransactionValidator,
  transactionIdValidator,
  financeReportValidator
};