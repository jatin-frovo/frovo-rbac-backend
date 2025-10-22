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
const { 
  createProductValidator,
  productIdValidator,
  handleValidationErrors 
} = require('../validators');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Product management routes
router.get('/', checkPermission('products', 'read'), getProducts);
router.get('/:id', productIdValidator, handleValidationErrors, checkPermission('products', 'read'), getProductById);
router.post('/', createProductValidator, handleValidationErrors, checkPermission('products', 'create'), createProduct);
router.put('/:id', productIdValidator, handleValidationErrors, createProductValidator, handleValidationErrors, checkPermission('products', 'update'), updateProduct);
router.delete('/:id', productIdValidator, handleValidationErrors, checkPermission('products', 'delete'), deleteProduct);

module.exports = router;