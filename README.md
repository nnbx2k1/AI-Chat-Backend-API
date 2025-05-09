# AI Chat Backend API

A robust backend service for AI-powered chat applications with document processing capabilities, multi-agent processing, and API key management.

## Features

- **Multiple AI Processing Endpoints**:
  - Use Case API: Process documents with text instructions
  - Reverse Transaction API: Convert and transform documents
  - Multi-Agent API: Process text with multiple AI agents

- **Authentication System**:
  - JWT-based authentication
  - API key management for programmatic access
  - Role-based permissions

- **API Management**:
  - Generate and manage API keys
  - Set permissions per API key
  - Configure rate limits
  - Track usage and analytics

- **File Handling**:
  - Document upload and processing
  - Secure document storage
  - Document download URLs

- **Transaction Tracking**:
  - Complete history of all API transactions
  - Status tracking for async processes
  - Detailed transaction logs

## Prerequisites

- Node.js (v16.x or higher)
- MongoDB (v4.x or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-chat-backend.git
cd ai-chat-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-chat-backend
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=1d
AI_API_ENDPOINT=https://api.your-ai-provider.com
AI_API_KEY=your_ai_provider_api_key
DOWNLOAD_URL_BASE=http://localhost:5000/downloads
```

4. Create required directories:
```bash
mkdir -p uploads downloads
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Documentation

### Authentication

#### Register a new user

```
POST /api/auth/register
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### API Key Management

#### Generate a new API key

```
POST /api/keys
```

Headers:
```
Authorization: Bearer <jwt_token>
```

Request body:
```json
{
  "name": "Production API Key",
  "permissions": {
    "useCaseApi": true,
    "reverseTransactionApi": true,
    "multiAgentApi": true
  },
  "rateLimit": {
    "requestsPerHour": 200
  }
}
```

#### Get all API keys

```
GET /api/keys
```

Headers:
```
Authorization: Bearer <jwt_token>
```

### AI Processing APIs

#### Use Case API

```
POST /api/ai/use-case
```

Headers:
```
X-API-Key: <api_key>
```

Request body (form-data):
```
text: "Analyze this document and generate a report"
document: [file upload]
```

#### Reverse Transaction API

```
POST /api/ai/reverse-transaction
```

Headers:
```
X-API-Key: <api_key>
```

Request body (form-data):
```
text: "Convert this document based on these instructions"
document: [file upload]
```

#### Multi-Agent API

```
POST /api/ai/multi-agent
```

Headers:
```
X-API-Key: <api_key>
Content-Type: application/json
```

Request body:
```json
{
  "text": "Generate a summary of the latest AI trends"
}
```

## Project Structure

```
ai-chat-backend/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Express middleware
├── models/             # Mongoose models
├── routes/             # Express routes
├── services/           # Business logic
├── utils/              # Utility functions
├── uploads/            # Uploaded documents
├── downloads/          # Processed documents
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies
├── server.js           # Application entry point
└── README.md           # Project documentation
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/ai-chat-backend |
| JWT_SECRET | Secret key for JWT | (Required) |
| JWT_EXPIRATION | JWT expiration time | 1d |
| AI_API_ENDPOINT | AI provider API endpoint | (Required) |
| AI_API_KEY | AI provider API key | (Required) |
| DOWNLOAD_URL_BASE | Base URL for downloads | http://localhost:5000/downloads |

## Error Handling

The API uses standard HTTP status codes and consistent error response format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication failed
- `403 Forbidden`: Not authorized to access the resource
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [Multer](https://github.com/expressjs/multer)

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername) - email@example.com

Project Link: [https://github.com/yourusername/ai-chat-backend](https://github.com/yourusername/ai-chat-backend)
