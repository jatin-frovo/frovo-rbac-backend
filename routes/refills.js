const express = require('express');
const {
  getRefillJobs,
  getRefillJobById,
  createRefillJob,
  updateRefillJobStatus,
  assignRefillJob,
  getRefillJobsByAgent
} = require('../controllers/refillController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  createRefillJobValidator,
  updateRefillJobValidator,
  refillJobIdValidator,
  userAgentIdValidator, // ✅ Changed from userIdValidator to userAgentIdValidator
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('refills', 'read'), getRefillJobs);
router.get('/:id', refillJobIdValidator, handleValidationErrors, checkPermission('refills', 'read'), getRefillJobById);
router.post('/', createRefillJobValidator, handleValidationErrors, checkPermission('refills', 'create'), createRefillJob);
router.put('/:id/status', refillJobIdValidator, handleValidationErrors, updateRefillJobValidator, handleValidationErrors, checkPermission('refills', 'update'), updateRefillJobStatus);
router.patch('/:id/assign', refillJobIdValidator, handleValidationErrors, checkPermission('refills', 'assign'), assignRefillJob);

// ✅ FIXED: Use userAgentIdValidator instead of userIdValidator
router.get('/agent/:agentId', userAgentIdValidator, handleValidationErrors, checkPermission('refills', 'read'), getRefillJobsByAgent);

module.exports = router;