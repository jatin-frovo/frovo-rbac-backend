const express = require('express');
const {
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs
} = require('../controllers/auditController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  auditLogIdValidator,
  auditQueryValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', auditQueryValidator, handleValidationErrors, checkPermission('audit', 'read'), getAuditLogs);
router.get('/:id', auditLogIdValidator, handleValidationErrors, checkPermission('audit', 'read'), getAuditLogById);
router.get('/export/csv', auditQueryValidator, handleValidationErrors, checkPermission('audit', 'read'), exportAuditLogs);

module.exports = router;