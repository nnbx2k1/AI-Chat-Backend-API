const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config/config');

// Process a use case request
exports.processUseCase = async (text, documentPath) => {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('document', fs.createReadStream(documentPath));
    
    const response = await axios.post(
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
    
    return response.data;
  } catch (error) {
    console.error('AI Service - Use Case Error:', error);
    throw new Error('Error processing use case request');
  }
};

// Process a reverse transaction request
exports.processReverseTransaction = async (text, documentPath) => {
  try {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('document', fs.createReadStream(documentPath));
    
    const response = await axios.post(
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
    
    return response.data;
  } catch (error) {
    console.error('AI Service - Reverse Transaction Error:', error);
    throw new Error('Error processing reverse transaction request');
  }
};

// Process a multi-agent request
exports.processMultiAgent = async (text) => {
  try {
    const response = await axios.post(
      `${config.aiApiEndpoint}/multi-agent`,
      { text },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.aiApiKey}`
        }
      }
    );
    
    return response.data.response;
  } catch (error) {
    console.error('AI Service - Multi Agent Error:', error);
    throw new Error('Error processing multi-agent request');
  }
};