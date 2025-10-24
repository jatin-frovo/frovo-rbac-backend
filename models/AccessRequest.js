const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  permissions: [{
    resource: String,
    actions: [String]
  }],
  reason: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    start: Date,
    end: Date
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  approvedAt: Date,
  rejectedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: String
}, {
  timestamps: true
});

// Indexes
accessRequestSchema.index({ userId: 1, status: 1 });
accessRequestSchema.index({ status: 1, createdAt: 1 });
accessRequestSchema.index({ 'duration.end': 1 });

// Pre-save middleware to check expiration
accessRequestSchema.pre('save', function(next) {
  if (this.duration && this.duration.end && new Date() > this.duration.end) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('AccessRequest', accessRequestSchema);