const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

// Save a document to the file system
exports.saveDocument = async (buffer, originalFilename) => {
  try {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}${path.extname(originalFilename)}`;
    const filePath = path.join(config.uploadDir, uniqueFilename);
    
    // Write the file
    fs.writeFileSync(filePath, buffer);
    
    return {
      filename: uniqueFilename,
      path: filePath,
      size: buffer.length
    };
  } catch (error) {
    console.error('Document Service - Save Error:', error);
    throw new Error('Error saving document');
  }
};

// Generate a download URL for a document
exports.generateDownloadUrl = (filename) => {
  return `${config.downloadUrlBase}/${filename}`;
};