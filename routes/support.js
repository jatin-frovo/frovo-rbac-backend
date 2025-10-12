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

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/tickets', checkPermission('support', 'read'), getSupportTickets);
router.get('/tickets/:id', checkPermission('support', 'read'), getSupportTicketById);
router.post('/tickets', checkPermission('support', 'create'), createSupportTicket);
router.put('/tickets/:id', checkPermission('support', 'update'), updateSupportTicket);
router.post('/tickets/:id/response', checkPermission('support', 'update'), addTicketResponse);
router.post('/refunds', checkPermission('support', 'create'), processRefund);
router.get('/stats/dashboard', checkPermission('support', 'read'), getSupportStats);

module.exports = router;