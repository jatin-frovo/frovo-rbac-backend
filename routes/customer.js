const express = require('express');
const {
  getProducts,
  getMachines,
  createOrder,
  getCustomerOrders,
  updateOrderStatus
} = require('../controllers/customerController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Customer-specific routes
router.get('/products', checkPermission('products', 'read'), getProducts);
router.get('/machines', checkPermission('machines', 'read'), getMachines);
router.post('/orders', checkPermission('orders', 'create'), createOrder);
router.get('/orders', checkPermission('orders', 'read'), getCustomerOrders);
router.put('/orders/:id', checkPermission('orders', 'update'), updateOrderStatus);

module.exports = router;