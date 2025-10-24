const express = require('express');
const {
  createInvitation,
  getInvitations,
  acceptInvitation,
  cancelInvitation
} = require('../controllers/invitationController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  createInvitationValidator,
  invitationIdValidator,
  acceptInvitationValidator,
  invitationQueryValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// Public route (no auth required)
router.post('/accept', acceptInvitationValidator, handleValidationErrors, acceptInvitation);

// Protected routes
router.use(auth);
router.post('/', checkPermission('users', 'create'), createInvitationValidator, handleValidationErrors, createInvitation);
router.get('/', invitationQueryValidator, handleValidationErrors, checkPermission('users', 'read'), getInvitations);
router.patch('/:id/cancel', invitationIdValidator, handleValidationErrors, checkPermission('users', 'delete'), cancelInvitation);

module.exports = router;