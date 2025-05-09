const asyncHandler = require('express-async-handler');
const ApiKey = require('../models/ApiKey');
const Usage = require('../models/Usage');

// @desc    Generate new API key
// @route   POST /api/keys
// @access  Private
exports.generateApiKey = asyncHandler(async (req, res) => {
  const { name, permissions, rateLimit } = req.body;

  // Generate a new API key
  const key = ApiKey.generateKey();

  // Create API key in database
  const apiKey = await ApiKey.create({
    key,
    user: req.user._id,
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

  res.status(201).json({
    success: true,
    data: {
      _id: apiKey._id,
      name: apiKey.name,
      key: apiKey.key,
      permissions: apiKey.permissions,
      rateLimit: apiKey.rateLimit,
      createdAt: apiKey.createdAt
    }
  });
});

// @desc    Get all API keys for a user
// @route   GET /api/keys
// @access  Private
exports.getApiKeys = asyncHandler(async (req, res) => {
  const apiKeys = await ApiKey.find({ user: req.user._id }).select('-key');

  res.status(200).json({
    success: true,
    count: apiKeys.length,
    data: apiKeys
  });
});

// @desc    Get usage statistics for an API key
// @route   GET /api/keys/:id/usage
// @access  Private
exports.getApiKeyUsage = asyncHandler(async (req, res) => {
  // Check if API key belongs to user
  const apiKey = await ApiKey.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!apiKey) {
    res.status(404);
    throw new Error('API key not found');
  }

  // Get usage data
  const today = new Date();
  const lastMonth = new Date(today.setMonth(today.getMonth() - 1));

  const usage = await Usage.find({
    apiKey: req.params.id,
    timestamp: { $gte: lastMonth }
  });

  // Group usage by endpoint and day
  const usageByEndpoint = {};
  const usageByDay = {};

  usage.forEach(record => {
    // By endpoint
    if (!usageByEndpoint[record.endpoint]) {
      usageByEndpoint[record.endpoint] = 0;
    }
    usageByEndpoint[record.endpoint]++;

    // By day
    const day = record.timestamp.toISOString().split('T')[0];
    if (!usageByDay[day]) {
      usageByDay[day] = 0;
    }
    usageByDay[day]++;
  });

  res.status(200).json({
    success: true,
    data: {
      total: usage.length,
      byEndpoint: usageByEndpoint,
      byDay: usageByDay
    }
  });
});

// @desc    Revoke API key
// @route   DELETE /api/keys/:id
// @access  Private
exports.revokeApiKey = asyncHandler(async (req, res) => {
  // Check if API key belongs to user
  const apiKey = await ApiKey.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!apiKey) {
    res.status(404);
    throw new Error('API key not found');
  }

  // Deactivate the key (don't delete it to preserve usage history)
  apiKey.active = false;
  await apiKey.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});
