const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const AuditLog = require('../models/AuditLog');

const getInventory = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lt: ['$currentStock', '$minStockLevel'] };
    }

    const products = await Product.find(query).populate('supplier');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    // Log inventory action
    await InventoryLog.create({
      productId: product._id,
      action: 'add_product',
      quantity: product.currentStock,
      performedBy: req.user.id,
      notes: 'New product added to inventory'
    });

    // Audit log
    await AuditLog.create({
      userId: req.user.id,
      action: 'create_product',
      resource: 'inventory',
      resourceId: product._id,
      newState: product
    });

    res.status(201).json({
      message: 'Product added successfully',
      product: await product.populate('supplier')
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('supplier');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await AuditLog.create({
      userId: req.user.id,
      action: 'update_product',
      resource: 'inventory',
      resourceId: product._id,
      newState: product
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { quantity, action, notes } = req.body; // action: 'add', 'remove', 'set'

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = product.currentStock;

    switch (action) {
      case 'add':
        product.currentStock += quantity;
        break;
      case 'remove':
        product.currentStock = Math.max(0, product.currentStock - quantity);
        break;
      case 'set':
        product.currentStock = quantity;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await product.save();

    // Log inventory action
    await InventoryLog.create({
      productId: product._id,
      action: `stock_${action}`,
      quantity,
      previousStock,
      newStock: product.currentStock,
      performedBy: req.user.id,
      notes
    });

    res.json({
      message: 'Stock updated successfully',
      product: await product.populate('supplier'),
      previousStock,
      newStock: product.currentStock
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating stock', error: error.message });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lt: ['$currentStock', '$minStockLevel'] }
    }).populate('supplier');

    res.json({
      alertCount: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock alerts', error: error.message });
  }
};

const getInventoryReports = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;

    let report;
    
    switch (reportType) {
      case 'stock-movement':
        report = await getStockMovementReport(startDate, endDate);
        break;
      case 'low-stock':
        report = await getLowStockReport();
        break;
      case 'category-summary':
        report = await getCategorySummaryReport();
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error generating inventory report', error: error.message });
  }
};

// Helper functions for reports
const getStockMovementReport = async (startDate, endDate) => {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return await InventoryLog.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);
};

const getLowStockReport = async () => {
  return await Product.find({
    $expr: { $lt: ['$currentStock', '$minStockLevel'] }
  }).populate('supplier');
};

const getCategorySummaryReport = async () => {
  return await Product.aggregate([
    {
      $group: {
        _id: '$category',
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$currentStock' },
        totalValue: { $sum: { $multiply: ['$currentStock', '$price'] } },
        lowStockCount: {
          $sum: {
            $cond: [{ $lt: ['$currentStock', '$minStockLevel'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

module.exports = {
  getInventory,
  getProductById,
  addProduct,
  updateProduct,
  updateStock,
  getLowStockAlerts,
  getInventoryReports
};