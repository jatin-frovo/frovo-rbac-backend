const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['sale', 'refund', 'payout', 'purchase'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital', 'digital_wallet', 'upi'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending', 'refunded'],
    default: 'success'
  },
  transactionReference: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'cash', 'internal']
  },
  gatewayTransactionId: String,
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Transaction', transactionSchema);