const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital_wallet', 'upi'],
    required: true
  },
  transactionId: {
    type: String
  },
  deliveryStatus: {
    type: String,
    enum: ['waiting', 'dispensing', 'delivered', 'failed'],
    default: 'waiting'
  },
  notes: String
}, {
  timestamps: true
});

// Add index for better query performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ machineId: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);