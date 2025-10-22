const { body, param, query } = require('express-validator');

const createMaintenanceJobValidator = [
  body('machineId')
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('issueType')
    .isIn(['breakdown', 'preventive', 'predictive', 'cleaning', 'other'])
    .withMessage('Invalid issue type'),
  
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10-1000 characters'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  
  body('assignedTechnician')
    .optional()
    .isMongoId()
    .withMessage('Invalid technician ID'),
  
  body('reportedBy')
    .isMongoId()
    .withMessage('Invalid reporter ID')
];

const updateMaintenanceJobValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid maintenance job ID'),
  
  body('status')
    .optional()
    .isIn(['open', 'assigned', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('resolution')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Resolution cannot exceed 1000 characters'),
  
  body('partsUsed')
    .optional()
    .isArray()
    .withMessage('Parts used must be an array'),
  
  body('partsUsed.*.name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Part name must be between 1-100 characters'),
  
  body('partsUsed.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Part quantity must be at least 1'),
  
  body('partsUsed.*.cost')
    .isFloat({ min: 0 })
    .withMessage('Part cost must be a positive number'),
  
  body('timeSpent')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time spent must be at least 1 minute')
];

const maintenanceJobIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid maintenance job ID')
];

const maintenanceQueryValidator = [
  query('status')
    .optional()
    .isIn(['open', 'assigned', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('issueType')
    .optional()
    .isIn(['breakdown', 'preventive', 'predictive', 'cleaning', 'other'])
    .withMessage('Invalid issue type filter'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority filter')
];

module.exports = {
  createMaintenanceJobValidator,
  updateMaintenanceJobValidator,
  maintenanceJobIdValidator,
  maintenanceQueryValidator
};