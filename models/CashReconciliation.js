const mongoose = require('mongoose');

const cashReconciliationSchema = new mongoose.Schema({
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  expectedAmount: {
    type: Number,
    required: true
  },
  actualAmount: {
    type: Number,
    required: true
  },
  variance: {
    type: Number,
    required: true
  },
  notes: String,
  reconciledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CashReconciliation', cashReconciliationSchema);