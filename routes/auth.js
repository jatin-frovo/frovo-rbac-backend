const express = require('express');
const { register, login, getProfile, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { authLimiter, createAccountLimiter } = require('../middleware/rateLimit');
const { 
  registerValidator, 
  loginValidator, 
  changePasswordValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// Apply specific rate limiters and validators
router.post('/register', createAccountLimiter, registerValidator, handleValidationErrors, register);
router.post('/login', authLimiter, loginValidator, handleValidationErrors, login);
router.get('/profile', auth, getProfile);
router.put('/change-password', auth, changePasswordValidator, handleValidationErrors, changePassword);
router.post('/reinitialize-roles', auth, (req, res) => {
  // Only allow super admin to reinitialize roles
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admin can reinitialize roles'
    });
  }
  
  initializeRoles();
  res.json({
    success: true,
    message: 'Roles reinitialization started...'
  });
});

module.exports = router;