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

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('refills', 'read'), getRefillJobs);
router.get('/:id', checkPermission('refills', 'read'), getRefillJobById);
router.post('/', checkPermission('refills', 'create'), createRefillJob);
router.put('/:id/status', checkPermission('refills', 'update'), updateRefillJobStatus);
router.patch('/:id/assign', checkPermission('refills', 'assign'), assignRefillJob);

// SIMPLE: Just use required parameter
router.get('/agent/:agentId', checkPermission('refills', 'read'), getRefillJobsByAgent);

module.exports = router;