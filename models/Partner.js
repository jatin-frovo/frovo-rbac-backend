const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  contact: {
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  machines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  }],
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    commissionRate: {
      type: Number,
      default: 0.15
    }, // 15%
    payoutFrequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly'],
      default: 'monthly'
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
partnerSchema.index({ name: 1 });
partnerSchema.index({ code: 1 });
partnerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Partner', partnerSchema);