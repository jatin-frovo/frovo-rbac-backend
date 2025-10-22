const express = require('express');
const {
  getPlanograms,
  getPlanogramById,
  createPlanogram,
  updatePlanogram,
  assignProductsToPlanogram,
  getPlanogramByMachine
} = require('../controllers/planogramController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');
const { 
  createPlanogramValidator,
  updatePlanogramValidator,
  planogramIdValidator,
  machineIdValidator, // ✅ Add machineIdValidator import
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('planograms', 'read'), getPlanograms);
router.get('/:id', planogramIdValidator, handleValidationErrors, checkPermission('planograms', 'read'), getPlanogramById);
router.post('/', createPlanogramValidator, handleValidationErrors, checkPermission('planograms', 'create'), createPlanogram);
router.put('/:id', planogramIdValidator, handleValidationErrors, updatePlanogramValidator, handleValidationErrors, checkPermission('planograms', 'update'), updatePlanogram);
router.patch('/:id/assign-products', planogramIdValidator, handleValidationErrors, checkPermission('planograms', 'update'), assignProductsToPlanogram);

// ✅ FIXED: machineIdValidator is now imported
router.get('/machine/:machineId', machineIdValidator, handleValidationErrors, checkPermission('planograms', 'read'), getPlanogramByMachine);

module.exports = router;