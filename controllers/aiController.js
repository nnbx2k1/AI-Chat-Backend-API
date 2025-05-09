const asyncHandler = require('express-async-handler');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const config = require('../config/config');
const Transaction = require('../models/Transaction');
const Usage = require('../models/Usage');

// Helper function to track API usage
const trackUsage = async (req, endpoint, requestSize, responseSize, documentSize, processingTime, successful, error = null) => {
  return await Usage.create({
    user: req.user._id,
    apiKey: req.apiKey._id,
    endpoint,
    requestSize,
    responseSize,
    documentSize,
    processingTime,
    successful,
    error: error ? error.toString() : null
  });
};

// Helper function to create a transaction record
const createTransaction = async (req, type, inputText = null, inputDocumentPath = null) => {
  return await Transaction.create({
    user: req.user._id,
    apiKey: req.apiKey._id,
    type,
    inputText,
    inputDocumentPath,
    status: 'pending'
  });
};

// Helper function to update a transaction record
const updateTransaction = async (transactionId, status, outputDocumentPath = null, outputText = null, downloadUrl = null) => {
  const completedAt = status === 'completed' ? new Date() : undefined;
  
  return await Transaction.findByIdAndUpdate(
    transactionId,
    {
      status,
      outputDocumentPath,
      outputText,
      downloadUrl,
      completedAt
    },
    { new: true }
  );
};

// @desc    Use Case API (document + text input, document output)
// @route   POST /api/ai/use-case
// @access  Private (API Key)
exports.useCaseApi = asyncHandler(async (req, res) => {
  // Check if API key has permission
  if (!req.apiKey.permissions.useCaseApi) {
    res.status(403);
    throw new Error('API key does not have permission to access this endpoint');
  }

  const { text } = req.body;
  const startTime = Date.now();
  let requestSize = text ? text.length : 0;
  let documentSize = 0;
  
  // Check for document file
  if (!req.file) {
    res.status(400);
    throw new Error('Document file is required');
  }
  
  // Get file details
  const inputFilePath = req.file.path;
  documentSize = req.file.size;
  requestSize += documentSize;
  
  try {
    // Create transaction record
    const transaction = await createTransaction(req, 'useCase', text, inputFilePath);
    
    // Prepare form data for the AI API
    const formData = new FormData();
    formData.append('text', text);
    formData.append('document', fs.createReadStream(inputFilePath));
    
    // Call the AI API
    const aiResponse = await axios.post(
      `${config.aiApiEndpoint}/use-case`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${config.aiApiKey}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Generate unique filename for the response document
    const outputFilename = `usecase_${uuidv4()}${path.extname(req.file.originalname)}`;
    const outputFilePath = path.join(config.downloadDir, outputFilename);
    
    // Save the response as a file
    fs.writeFileSync(outputFilePath, aiResponse.data);
    
    // Generate download URL
    const downloadUrl = `${config.downloadUrlBase}/${outputFilename}`;
    
    // Update transaction record
    await updateTransaction(
      transaction._id,
      'completed',
      outputFilePath,
      null,
      downloadUrl
    );
    
    // Track usage
    const processingTime = Date.now() - startTime;
    const responseSize = aiResponse.data.length;
    await trackUsage(req, 'useCase', requestSize, responseSize, documentSize, processingTime, true);
    
    res.status(200).json({
      success: true,
      data: {
        downloadUrl,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    console.error('Use Case API Error:', error);
    
    // Track failed usage
    const processingTime = Date.now() - startTime;
    await trackUsage(req, 'useCase', requestSize, 0, documentSize, processingTime, false, error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error processing your request. Please try again.'
    });
  }
});

// @desc    Reverse Transaction API (text + document input, document output)
// @route   POST /api/ai/reverse-transaction
// @access  Private (API Key)
exports.reverseTransactionApi = asyncHandler(async (req, res) => {
  // Check if API key has permission
  if (!req.apiKey.permissions.reverseTransactionApi) {
    res.status(403);
    throw new Error('API key does not have permission to access this endpoint');
  }

  const { text } = req.body;
  const startTime = Date.now();
  let requestSize = text ? text.length : 0;
  let documentSize = 0;
  
  // Check for document file
  if (!req.file) {
    res.status(400);
    throw new Error('Document file is required');
  }
  
  // Get file details
  const inputFilePath = req.file.path;
  documentSize = req.file.size;
  requestSize += documentSize;
  
  try {
    // Create transaction record
    const transaction = await createTransaction(req, 'reverseTransaction', text, inputFilePath);
    
    // Prepare form data for the AI API
    const formData = new FormData();
    formData.append('text', text);
    formData.append('document', fs.createReadStream(inputFilePath));
    
    // Call the AI API
    const aiResponse = await axios.post(
      `${config.aiApiEndpoint}/reverse-transaction`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${config.aiApiKey}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Generate unique filename for the response document
    const outputFilename = `reverse_${uuidv4()}${path.extname(req.file.originalname)}`;
    const outputFilePath = path.join(config.downloadDir, outputFilename);
    
    // Save the response as a file
    fs.writeFileSync(outputFilePath, aiResponse.data);
    
    // Generate download URL
    const downloadUrl = `${config.downloadUrlBase}/${outputFilename}`;
    
    // Update transaction record
    await updateTransaction(
      transaction._id,
      'completed',
      outputFilePath,
      null,
      downloadUrl
    );
    
    // Track usage
    const processingTime = Date.now() - startTime;
    const responseSize = aiResponse.data.length;
    await trackUsage(req, 'reverseTransaction', requestSize, responseSize, documentSize, processingTime, true);
    
    res.status(200).json({
      success: true,
      data: {
        downloadUrl,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    console.error('Reverse Transaction API Error:', error);
    
    // Track failed usage
    const processingTime = Date.now() - startTime;
    await trackUsage(req, 'reverseTransaction', requestSize, 0, documentSize, processingTime, false, error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error processing your request. Please try again.'
    });
  }
});
// @desc    Multi-Agent API (text input, text output)
// @route   POST /api/ai/multi-agent
// @access  Private (API Key)
exports.multiAgentApi = asyncHandler(async (req, res) => {
  // Check if API key has permission
  if (!req.apiKey.permissions.multiAgentApi) {
    res.status(403);
    throw new Error('API key does not have permission to access this endpoint');
  }

  const { text } = req.body;
  const startTime = Date.now();
  
  if (!text) {
    res.status(400);
    throw new Error('Text input is required');
  }
  
  const requestSize = text.length;
  
  try {
    // Create transaction record
    const transaction = await createTransaction(req, 'multiAgent', text);
    
    // Call the AI API
    const aiResponse = await axios.post(
      `${config.aiApiEndpoint}/multi-agent`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.aiApiKey}`
        }
      }
    );
    
    const responseText = aiResponse.data.response;
    
    // Update transaction record
    await updateTransaction(
      transaction._id,
      'completed',
      null,
      responseText
    );
    
    // Track usage
    const processingTime = Date.now() - startTime;
    const responseSize = responseText.length;
    await trackUsage(req, 'multiAgent', requestSize, responseSize, 0, processingTime, true);
    
    res.status(200).json({
      success: true,
      data: {
        response: responseText,
        transactionId: transaction._id
      }
    });
  } catch (error) {
    console.error('Multi-Agent API Error:', error);
    
    // Track failed usage
    const processingTime = Date.now() - startTime;
    await trackUsage(req, 'multiAgent', requestSize, 0, 0, processingTime, false, error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error processing your request. Please try again.'
    });
  }
});

// @desc    Get transaction details
// @route   GET /api/ai/transactions/:id
// @access  Private (API Key)
exports.getTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    List user transactions
// @route   GET /api/ai/transactions
// @access  Private (API Key or JWT)
exports.listTransactions = asyncHandler(async (req, res) => {
  const { limit = 10, skip = 0, type } = req.query;

  const query = { user: req.user._id };
  
  if (type) {
    query.type = type;
  }
  
  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));
    
  const count = await Transaction.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    data: transactions
  });
});