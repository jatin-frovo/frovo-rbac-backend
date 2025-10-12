const mongoose = require('mongoose');

const maintenanceJobSchema = new mongoose.Schema({
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  issueType: {
    type: String,
    enum: ['breakdown', 'preventive', 'predictive', 'cleaning', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resolution: String,
  partsUsed: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  timeSpent: Number, // in minutes
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('MaintenanceJob', maintenanceJobSchema);