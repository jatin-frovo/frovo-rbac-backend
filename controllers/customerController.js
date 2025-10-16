const Order = require('../models/Order');
const Product = require('../models/Product');
const Machine = require('../models/Machine');
const Transaction = require('../models/Transaction');

// Get all products (for customer browsing)
const getProducts = async (req, res) => {
  try {
    const { category, available } = req.query;
    
    let query = { isAvailable: true };
    
    if (category) {
      query.category = category;
    }
    
    if (available === 'true') {
      query.stockQuantity = { $gt: 0 };
    }

    const products = await Product.find(query);
    
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

// Get available machines
const getMachines = async (req, res) => {
  try {
    const { region, status } = req.query;
    
    let query = { status: 'active' };
    
    if (region) {
      query.region = region;
    }
    
    if (status) {
      query.status = status;
    }

    const machines = await Machine.find(query)
      .populate('currentStock.product', 'name price image');
    
    res.json({
      success: true,
      data: machines,
      count: machines.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching machines',
      error: error.message
    });
  }
};

// Create order
const createOrder = async (req, res) => {
  try {
    const { machineId, items, paymentMethod } = req.body;
    
    // Validate required fields
    if (!machineId || !items || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'machineId, items, and paymentMethod are required'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const productDetails = [];
    
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }
      
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }
      
      totalAmount += product.price * item.quantity;
      productDetails.push({
        product: item.product,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create order
    const order = new Order({
      customerId: req.user.id,
      machineId,
      items: productDetails,
      totalAmount,
      paymentMethod,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: await order.populate('items.product machineId')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get customer orders
const getCustomerOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { customerId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price image')
      .populate('machineId', 'name location')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Update order status (for customer to cancel)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Only allow cancellation for pending orders
    if (status === 'cancelled' && order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }
    
    order.status = status;
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: await order.populate('items.product machineId')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getMachines,
  createOrder,
  getCustomerOrders,
  updateOrderStatus
};