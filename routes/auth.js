const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { authLimiter, createAccountLimiter } = require('../middleware/rateLimit');

const router = express.Router();

// Apply specific rate limiters
router.post('/register', createAccountLimiter, register);
router.post('/login', authLimiter, login);
router.get('/profile', auth, getProfile);

module.exports = router;