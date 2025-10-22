const { body, param, query } = require('express-validator');

const createSupportTicketValidator = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5-200 characters'),
  
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10-1000 characters'),
  
  body('issueType')
    .isIn(['technical', 'billing', 'refund', 'general', 'complaint'])
    .withMessage('Invalid issue type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  
  body('machineId')
    .optional()
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('createdBy')
    .isMongoId()
    .withMessage('Invalid creator ID')
];

const updateSupportTicketValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID'),
  
  body('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid ticket status'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID'),
  
  body('resolution')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Resolution cannot exceed 1000 characters')
];

const addTicketResponseValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID'),
  
  body('message')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1-500 characters'),
  
  body('isInternal')
    .optional()
    .isBoolean()
    .withMessage('isInternal must be a boolean')
];

const ticketIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticket ID')
];

const ticketQueryValidator = [
  query('status')
    .optional()
    .isIn(['open', 'in_progress', 'resolved', 'closed'])
    .withMessage('Invalid status filter'),
  
  query('issueType')
    .optional()
    .isIn(['technical', 'billing', 'refund', 'general', 'complaint'])
    .withMessage('Invalid issue type filter'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority filter')
];

module.exports = {
  createSupportTicketValidator,
  updateSupportTicketValidator,
  addTicketResponseValidator,
  ticketIdValidator,
  ticketQueryValidator
};