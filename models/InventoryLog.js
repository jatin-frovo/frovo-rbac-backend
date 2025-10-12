const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['add_product', 'stock_add', 'stock_remove', 'stock_set', 'adjustment']
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: Number,
  newStock: Number,
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);