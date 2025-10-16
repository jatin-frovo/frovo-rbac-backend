const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/rbac');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Product management routes
router.get('/', checkPermission('products', 'read'), getProducts);
router.get('/:id', checkPermission('products', 'read'), getProductById);
router.post('/', checkPermission('products', 'create'), createProduct);
router.put('/:id', checkPermission('products', 'update'), updateProduct);
router.delete('/:id', checkPermission('products', 'delete'), deleteProduct);

module.exports = router;