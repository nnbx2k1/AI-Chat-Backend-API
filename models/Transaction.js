const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['useCase', 'reverseTransaction', 'multiAgent']
  },
  inputText: {
    type: String
  },
  inputDocumentPath: {
    type: String
  },
  outputDocumentPath: {
    type: String
  },
  outputText: {
    type: String
  },
  downloadUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);