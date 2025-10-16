const Product = require('../models/Product');

// Get all products
const getProducts = async (req, res) => {
  try {
    const { category, available } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (available === 'true') {
      query.isAvailable = true;
      query.stockQuantity = { $gt: 0 };
    }

    const products = await Product.find(query).sort({ name: 1 });
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching products', 
      error: error.message 
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching product', 
      error: error.message 
    });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, nutritionalInfo, stockQuantity, sku, brand } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and category are required'
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      nutritionalInfo,
      stockQuantity: stockQuantity || 0,
      sku,
      brand,
      isAvailable: (stockQuantity || 0) > 0
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error creating product', 
      error: error.message 
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, nutritionalInfo, stockQuantity, sku, brand, isAvailable } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price }),
        ...(category && { category }),
        ...(image && { image }),
        ...(nutritionalInfo && { nutritionalInfo }),
        ...(stockQuantity !== undefined && { 
          stockQuantity,
          isAvailable: stockQuantity > 0 
        }),
        ...(sku && { sku }),
        ...(brand && { brand }),
        ...(isAvailable !== undefined && { isAvailable })
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating product', 
      error: error.message 
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: product._id,
        name: product.name
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting product', 
      error: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};