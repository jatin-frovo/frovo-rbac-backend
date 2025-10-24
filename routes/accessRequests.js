const express = require('express');
const {
  createAccessRequest,
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  getAccessRequestStats
} = require('../controllers/accessRequestController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  createAccessRequestValidator,
  accessRequestIdValidator,
  accessRequestQueryValidator,
  approveRejectValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

router.use(auth);

router.post('/', createAccessRequestValidator, handleValidationErrors, createAccessRequest);
router.get('/', accessRequestQueryValidator, handleValidationErrors, getAccessRequests);
router.get('/stats', checkPermission('access_requests', 'read'), getAccessRequestStats);
router.patch('/:id/approve', accessRequestIdValidator, handleValidationErrors, approveRejectValidator, handleValidationErrors, checkPermission('access_requests', 'approve'), approveAccessRequest);
router.patch('/:id/reject', accessRequestIdValidator, handleValidationErrors, approveRejectValidator, handleValidationErrors, checkPermission('access_requests', 'approve'), rejectAccessRequest);

module.exports = router;