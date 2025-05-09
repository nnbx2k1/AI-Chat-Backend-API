const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');

// Generate a new API key
exports.generateApiKey = async (userId, name, permissions, rateLimit) => {
  try {
    // Generate a cryptographically secure random key
    const key = crypto.randomBytes(32).toString('hex');
    
    // Create API key record in database
    const apiKey = await ApiKey.create({
      key,
      user: userId,
      name: name || 'API Key',
      permissions: permissions || {
        useCaseApi: true,
        reverseTransactionApi: true,
        multiAgentApi: true
      },
      rateLimit: rateLimit || {
        requestsPerHour: 100
      }
    });
    
    return apiKey;
  } catch (error) {
    console.error('API Key Service - Generate Error:', error);
    throw new Error('Error generating API key');
  }
};

// Validate an API key
exports.validateApiKey = async (key) => {
  try {
    const apiKey = await ApiKey.findOne({ key, active: true });
    
    if (!apiKey) {
      return false;
    }
    
    // Update last used timestamp
    apiKey.lastUsedAt = new Date();
    await apiKey.save();
    
    return apiKey;
  } catch (error) {
    console.error('API Key Service - Validate Error:', error);
    return false;
  }
};
