const express = require('express');
const {
  getAuditLogs,
  getAuditLogById,
  exportAuditLogs
} = require('../controllers/auditController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('audit', 'read'), getAuditLogs);
router.get('/:id', checkPermission('audit', 'read'), getAuditLogById);
router.get('/export/csv', checkPermission('audit', 'read'), exportAuditLogs);

module.exports = router;