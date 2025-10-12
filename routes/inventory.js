const express = require('express');
const {
  getInventory,
  getProductById,
  addProduct,
  updateProduct,
  updateStock,
  getLowStockAlerts,
  getInventoryReports
} = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', checkPermission('inventory', 'read'), getInventory);
router.get('/products/:id', checkPermission('inventory', 'read'), getProductById);
router.post('/products', checkPermission('inventory', 'create'), addProduct);
router.put('/products/:id', checkPermission('inventory', 'update'), updateProduct);
router.patch('/products/:id/stock', checkPermission('inventory', 'update'), updateStock);
router.get('/alerts/low-stock', checkPermission('inventory', 'read'), getLowStockAlerts);
router.get('/reports/stock', checkPermission('inventory', 'read'), getInventoryReports);

module.exports = router;