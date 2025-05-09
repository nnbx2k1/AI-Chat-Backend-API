const express = require('express');
const { generateApiKey, getApiKeys, getApiKeyUsage, revokeApiKey } = require('../controllers/apiKeyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getApiKeys)
  .post(generateApiKey);

router.route('/:id/usage')
  .get(getApiKeyUsage);

router.route('/:id')
  .delete(revokeApiKey);

module.exports = router;