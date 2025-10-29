const { body, param } = require('express-validator');
const Role = require('../models/Role'); // Import Role model

const createUserValidator = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('role')
    .custom(async (role) => {
      // Check if role exists and is active in the database
      const roleExists = await Role.findOne({ 
        name: role,
        isActive: true 
      });
      
      if (!roleExists) {
        throw new Error('Invalid role specified');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .isMobilePhone('any') // More flexible phone validation
    .withMessage('Please provide a valid phone number'),
  
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID'),
  
  body('assignedRegions')
    .optional()
    .isArray()
    .withMessage('Assigned regions must be an array'),
  
  body('assignedRegions.*')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Region cannot be empty'),
  
  body('assignedMachines')
    .optional()
    .isArray()
    .withMessage('Assigned machines must be an array'),
  
  body('assignedMachines.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid machine ID'),
  
  body('preferredPaymentMethod')
    .optional()
    .isIn(['cash', 'card', 'digital_wallet', 'upi'])
    .withMessage('Invalid payment method'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2-50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('role')
    .optional()
    .custom(async (role) => {
      if (role) {
        const roleExists = await Role.findOne({ 
          name: role,
          isActive: true 
        });
        
        if (!roleExists) {
          throw new Error('Invalid role specified');
        }
      }
      return true;
    }),
  
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID'),
  
  body('assignedRegions')
    .optional()
    .isArray()
    .withMessage('Assigned regions must be an array'),
  
  body('assignedMachines')
    .optional()
    .isArray()
    .withMessage('Assigned machines must be an array'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const updateUserRoleAndDepartmentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('role')
    .optional()
    .custom(async (role) => {
      if (role) {
        const roleExists = await Role.findOne({ 
          name: role,
          isActive: true 
        });
        
        if (!roleExists) {
          throw new Error('Invalid role specified');
        }
      }
      return true;
    }),
  
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID')
];

const userIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

const userAgentIdValidator = [
  param('agentId')
    .isMongoId()
    .withMessage('Invalid agent ID')
];

const roleIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID')
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  updateUserRoleAndDepartmentValidator,
  userIdValidator,
  userAgentIdValidator,
  roleIdValidator
};