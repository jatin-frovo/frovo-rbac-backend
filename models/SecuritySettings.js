const mongoose = require('mongoose');

const securitySettingsSchema = new mongoose.Schema({
  organization: {
    type: String,
    default: 'Frovo',
    required: true
  },
  enforceMFA: {
    type: Boolean,
    default: false
  },
  ipAllowlist: [{
    ip: String,
    description: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  ssoConfig: {
    enabled: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ['google', 'microsoft', 'saml', 'oidc'],
      default: 'google'
    },
    clientId: String,
    clientSecret: String,
    metadataUrl: String,
    callbackUrl: String
  },
  passwordPolicy: {
    minLength: {
      type: Number,
      default: 8
    },
    requireUppercase: {
      type: Boolean,
      default: true
    },
    requireLowercase: {
      type: Boolean,
      default: true
    },
    requireNumbers: {
      type: Boolean,
      default: true
    },
    requireSpecialChars: {
      type: Boolean,
      default: true
    },
    expiryDays: {
      type: Number,
      default: 90
    },
    maxAttempts: {
      type: Number,
      default: 5
    },
    lockoutDuration: {
      type: Number,
      default: 30
    }
  },
  sessionSettings: {
    timeout: {
      type: Number,
      default: 24
    }, // hours
    maxConcurrentSessions: {
      type: Number,
      default: 3
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Singleton pattern - only one security settings document
securitySettingsSchema.statics.getSettings = function() {
  return this.findOne().sort({ createdAt: -1 });
};

module.exports = mongoose.model('SecuritySettings', securitySettingsSchema);