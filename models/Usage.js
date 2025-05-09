const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey',
    required: true
  },
  endpoint: {
    type: String,
    required: true,
    enum: ['useCase', 'reverseTransaction', 'multiAgent']
  },
  requestSize: {
    type: Number,
    default: 0
  },
  responseSize: {
    type: Number,
    default: 0
  },
  documentSize: {
    type: Number,
    default: 0 // in bytes
  },
  processingTime: {
    type: Number,
    default: 0 // in milliseconds
  },
  successful: {
    type: Boolean,
    default: true
  },
  error: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usage', UsageSchema);
