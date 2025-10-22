const express = require('express');
const {
  getSupportTickets,
  getSupportTicketById,
  createSupportTicket,
  updateSupportTicket,
  addTicketResponse,
  processRefund,
  getSupportStats
} = require('../controllers/supportController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  createSupportTicketValidator,
  updateSupportTicketValidator,
  addTicketResponseValidator,
  ticketIdValidator,
  ticketQueryValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/tickets', ticketQueryValidator, handleValidationErrors, checkPermission('support', 'read'), getSupportTickets);
router.get('/tickets/:id', ticketIdValidator, handleValidationErrors, checkPermission('support', 'read'), getSupportTicketById);
router.post('/tickets', createSupportTicketValidator, handleValidationErrors, checkPermission('support', 'create'), createSupportTicket);
router.put('/tickets/:id', ticketIdValidator, handleValidationErrors, updateSupportTicketValidator, handleValidationErrors, checkPermission('support', 'update'), updateSupportTicket);
router.post('/tickets/:id/response', addTicketResponseValidator, handleValidationErrors, checkPermission('support', 'update'), addTicketResponse);
router.post('/refunds', checkPermission('support', 'create'), processRefund);
router.get('/stats/dashboard', checkPermission('support', 'read'), getSupportStats);

module.exports = router;