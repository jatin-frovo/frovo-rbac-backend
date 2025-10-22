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
const { 
  createMaintenanceJobValidator,
  updateMaintenanceJobValidator,
  maintenanceJobIdValidator,
  maintenanceQueryValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', maintenanceQueryValidator, handleValidationErrors, checkPermission('maintenance', 'read'), getMaintenanceJobs);
router.get('/:id', maintenanceJobIdValidator, handleValidationErrors, checkPermission('maintenance', 'read'), getMaintenanceJobById);
router.post('/', createMaintenanceJobValidator, handleValidationErrors, checkPermission('maintenance', 'create'), createMaintenanceJob);
router.put('/:id', maintenanceJobIdValidator, handleValidationErrors, updateMaintenanceJobValidator, handleValidationErrors, checkPermission('maintenance', 'update'), updateMaintenanceJob);
router.patch('/:id/assign', maintenanceJobIdValidator, handleValidationErrors, checkPermission('maintenance', 'assign'), assignMaintenanceJob);
router.get('/preventive/schedule', checkPermission('maintenance', 'read'), getPreventiveMaintenance);
router.get('/reports/summary', checkPermission('maintenance', 'read'), getMaintenanceReports);

module.exports = router;