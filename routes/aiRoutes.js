const express = require('express');
const { 
  useCaseApi, 
  reverseTransactionApi, 
  multiAgentApi,
  getTransaction,
  listTransactions
} = require('../controllers/aiController');
const { apiKeyAuth, protect } = require('../middleware/auth');
const { dynamicRateLimit, apiLimiter } = require('../middleware/apiLimiter');
const { upload } = require('../middleware/fileUpload');

const router = express.Router();

// Routes that can be accessed with either JWT or API Key
router.get('/transactions', protect, listTransactions);
router.get('/transactions/:id', protect, getTransaction);

// Routes that require API Key authentication
router.post(
  '/use-case',
  apiKeyAuth,
  dynamicRateLimit,
  upload.single('document'),
  useCaseApi
);

router.post(
  '/reverse-transaction',
  apiKeyAuth,
  dynamicRateLimit,
  upload.single('document'),
  reverseTransactionApi
);

router.post(
  '/multi-agent',
  apiKeyAuth,
  dynamicRateLimit,
  multiAgentApi
);

module.exports = router;