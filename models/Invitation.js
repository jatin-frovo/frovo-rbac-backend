const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // TTL index
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customMessage: String
}, {
  timestamps: true
});

// Indexes
invitationSchema.index({ email: 1, status: 1 });
invitationSchema.index({ token: 1 });
invitationSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);