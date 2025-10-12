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

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('planograms', 'read'), getPlanograms);
router.get('/:id', checkPermission('planograms', 'read'), getPlanogramById);
router.post('/', checkPermission('planograms', 'create'), createPlanogram);
router.put('/:id', checkPermission('planograms', 'update'), updatePlanogram);
router.patch('/:id/assign-products', checkPermission('planograms', 'update'), assignProductsToPlanogram);
router.get('/machine/:machineId', checkPermission('planograms', 'read'), getPlanogramByMachine);

module.exports = router;