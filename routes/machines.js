const express = require('express');
const {
  getMachines,
  getMachineById,
  createMachine,
  updateMachine
} = require('../controllers/machineController');
const auth = require('../middleware/auth');
const { checkPermission, checkAssignedMachine } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('machines', 'read'), getMachines);
router.get('/:id', checkPermission('machines', 'read'), checkAssignedMachine, getMachineById);
router.post('/', checkPermission('machines', 'create'), createMachine);
router.put('/:id', checkPermission('machines', 'update'), checkAssignedMachine, updateMachine);

module.exports = router;