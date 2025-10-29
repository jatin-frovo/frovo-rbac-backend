const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true
    // REMOVED THE CUSTOM VALIDATOR
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // More flexible phone validation
        if (!v) return true; // Phone is optional
        return /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(v);
      },
      message: 'Please provide a valid phone number'
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  assignedRegions: [{
    type: String,
    trim: true
  }],
  assignedMachines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine'
  }],
  preferredPaymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital_wallet', 'upi'],
    default: 'cash'
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  customerSince: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for user permissions (populated from role)
userSchema.virtual('permissions').get(function() {
  // This would be populated when needed
  return [];
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);