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
const { orderLimiter } = require('../middleware/rateLimit');
const { 
  createOrderValidator, 
  orderIdValidator, 
  customerQueryValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Customer-specific routes
router.get('/products', checkPermission('products', 'read'), getProducts);
router.get('/machines', checkPermission('machines', 'read'), getMachines);
router.post('/orders', orderLimiter, createOrderValidator, handleValidationErrors, checkPermission('orders', 'create'), createOrder);
router.get('/orders', customerQueryValidator, handleValidationErrors, checkPermission('orders', 'read'), getCustomerOrders);
router.put('/orders/:id', orderIdValidator, handleValidationErrors, checkPermission('orders', 'update'), updateOrderStatus);

module.exports = router;