const express = require('express');
const {
  getMaintenanceJobs,
  getMaintenanceJobById,
  createMaintenanceJob,
  updateMaintenanceJob,
  assignMaintenanceJob,
  getPreventiveMaintenance,
  getMaintenanceReports
} = require('../controllers/maintenanceController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('maintenance', 'read'), getMaintenanceJobs);
router.get('/:id', checkPermission('maintenance', 'read'), getMaintenanceJobById);
router.post('/', checkPermission('maintenance', 'create'), createMaintenanceJob);
router.put('/:id', checkPermission('maintenance', 'update'), updateMaintenanceJob);
router.patch('/:id/assign', checkPermission('maintenance', 'assign'), assignMaintenanceJob);
router.get('/preventive/schedule', checkPermission('maintenance', 'read'), getPreventiveMaintenance);
router.get('/reports/summary', checkPermission('maintenance', 'read'), getMaintenanceReports);

module.exports = router;