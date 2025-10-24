const express = require('express');
const {
  getSecuritySettings,
  updateSecuritySettings,
  addIPToAllowlist,
  toggleMFA
} = require('../controllers/securityController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  securitySettingsValidator,
  ipAllowlistValidator,
  toggleMFAValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

router.use(auth);

router.get('/', checkPermission('security', 'read'), getSecuritySettings);
router.put('/', checkPermission('security', 'update'), securitySettingsValidator, handleValidationErrors, updateSecuritySettings);
router.post('/ip-allowlist', checkPermission('security', 'update'), ipAllowlistValidator, handleValidationErrors, addIPToAllowlist);
router.patch('/mfa', checkPermission('security', 'update'), toggleMFAValidator, handleValidationErrors, toggleMFA);

module.exports = router;