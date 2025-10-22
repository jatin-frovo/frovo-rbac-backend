const express = require('express');
const {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine
} = require('../controllers/machineController');
const auth = require('../middleware/auth');
const { checkPermission, checkAssignedMachine } = require('../middleware/rbac');
const { 
  createMachineValidator,
  updateMachineValidator,
  machineIdValidator,
  machineQueryValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', machineQueryValidator, handleValidationErrors, checkPermission('machines', 'read'), getMachines);
router.get('/:id', machineIdValidator, handleValidationErrors, checkPermission('machines', 'read'), checkAssignedMachine, getMachineById);
router.post('/', createMachineValidator, handleValidationErrors, checkPermission('machines', 'create'), createMachine);
router.put('/:id', machineIdValidator, handleValidationErrors, updateMachineValidator, handleValidationErrors, checkPermission('machines', 'update'), checkAssignedMachine, updateMachine);

module.exports = router;