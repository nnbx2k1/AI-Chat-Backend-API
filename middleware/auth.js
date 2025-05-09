const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const config = require('../config/config');

// Protect routes with JWT
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from the token
    req.user = await User.findById(decoded.id);
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

// API Key authentication
exports.apiKeyAuth = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ success: false, error: 'API key is required' });
  }

  // Find the API key in the database
  const key = await ApiKey.findOne({ key: apiKey, active: true });

  if (!key) {
    return res.status(401).json({ success: false, error: 'Invalid or inactive API key' });
  }

  // Get the user associated with the API key
  const user = await User.findById(key.user);

  if (!user) {
    return res.status(401).json({ success: false, error: 'User not found' });
  }

  // Update last used timestamp
  key.lastUsedAt = new Date();
  await key.save();

  // Attach user and API key to request
  req.user = user;
  req.apiKey = key;

  next();
});