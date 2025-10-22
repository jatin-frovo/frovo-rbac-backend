const express = require('express');
const {
  getTransactions,
  getTransactionSummary,
  getPayouts,
  createPayout,
  updatePayoutStatus,
  cashReconciliation,
  getFinancialReports
} = require('../controllers/financeController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { paymentLimiter } = require('../middleware/rateLimit');
const { 
  createTransactionValidator,
  transactionIdValidator,
  financeReportValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/transactions', checkPermission('finance', 'read'), getTransactions);
router.get('/transactions/summary', checkPermission('finance', 'read'), getTransactionSummary);
router.get('/payouts', checkPermission('finance', 'read'), getPayouts);
router.post('/payouts', paymentLimiter, checkPermission('finance', 'create'), createPayout);
router.put('/payouts/:id', transactionIdValidator, handleValidationErrors, checkPermission('finance', 'update'), updatePayoutStatus);
router.post('/cash-reconciliation', paymentLimiter, checkPermission('finance', 'create'), cashReconciliation);
router.get('/reports/:reportType', financeReportValidator, handleValidationErrors, checkPermission('finance', 'read'), getFinancialReports);

module.exports = router;