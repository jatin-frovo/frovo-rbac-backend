const { body, param, query } = require('express-validator');

const createMachineValidator = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Machine name must be between 2-100 characters'),
  
  body('location')
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5-200 characters'),
  
  body('region')
    .isLength({ min: 2, max: 50 })
    .withMessage('Region must be between 2-50 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance', 'out_of_order'])
    .withMessage('Invalid status'),
  
  body('assignedAgent')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned agent ID')
];

const updateMachineValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Machine name must be between 2-100 characters'),
  
  body('location')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5-200 characters'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance', 'out_of_order'])
    .withMessage('Invalid status'),
  
  body('assignedAgent')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned agent ID')
];

const machineIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid machine ID')
];

const machineQueryValidator = [
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'maintenance', 'out_of_order'])
    .withMessage('Invalid status filter'),
  
  query('region')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Region filter cannot be empty'),
  
  query('assignedAgent')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned agent ID')
];

module.exports = {
  createMachineValidator,
  updateMachineValidator,
  machineIdValidator,
  machineQueryValidator
};