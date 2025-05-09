// middleware/apiLimiter.js
const rateLimit = require('express-rate-limit');
const asyncHandler = require('express-async-handler');
const moment = require('moment');
const Usage = require('../models/Usage');

// Configure dynamic rate limiting based on API key permissions
exports.dynamicRateLimit = asyncHandler(async (req, res, next) => {
  if (!req.apiKey) {
    return res.status(401).json({ success: false, error: 'API key is required for rate limiting' });
  }

  // Count requests made in the last hour using this API key
  const lastHour = moment().subtract(1, 'hour').toDate();
  
  const count = await Usage.countDocuments({
    apiKey: req.apiKey._id,
    timestamp: { $gte: lastHour }
  });

  // Check if limit is exceeded
  if (count >= req.apiKey.rateLimit.requestsPerHour) {
    return res.status(429).json({
      success: false,
      error: 'API rate limit exceeded. Please try again later.'
    });
  }

  next();
});

// General API limiter (as a fallback)
exports.apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});