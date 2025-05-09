const mongoose = require('mongoose');
const crypto = require('crypto');

const ApiKeySchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  permissions: {
    useCaseApi: {
      type: Boolean,
      default: true
    },
    reverseTransactionApi: {
      type: Boolean,
      default: true
    },
    multiAgentApi: {
      type: Boolean,
      default: true
    }
  },
  rateLimit: {
    requestsPerHour: {
      type: Number,
      default: 100
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsedAt: {
    type: Date
  }
});

// Generate API Key
ApiKeySchema.statics.generateKey = function() {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('ApiKey', ApiKeySchema);
