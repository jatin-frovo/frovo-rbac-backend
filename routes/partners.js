const express = require('express');
const {
  createPartner,
  getPartners,
  assignMachineToPartner,
  getPartnerMachines
} = require('../controllers/partnerController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  createPartnerValidator,
  partnerIdValidator,
  assignMachineValidator,
  partnerQueryValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

router.use(auth);

router.post('/', checkPermission('partners', 'create'), createPartnerValidator, handleValidationErrors, createPartner);
router.get('/', partnerQueryValidator, handleValidationErrors, checkPermission('partners', 'read'), getPartners);
router.post('/:id/assign-machine', partnerIdValidator, handleValidationErrors, assignMachineValidator, handleValidationErrors, checkPermission('partners', 'update'), assignMachineToPartner);
router.get('/:id/machines', partnerIdValidator, handleValidationErrors, checkPermission('partners', 'read'), getPartnerMachines);

module.exports = router;