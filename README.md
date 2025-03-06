# Image Processing Service

A Node.js microservice for processing and storing images using TypeScript, Express, MongoDB, Redis, and Cloudinary.

## Features

- Asynchronous image processing using Bull Queue and Redis
- Image storage in Cloudinary CDN
- MongoDB for request tracking and persistence
- Built with TypeScript and Express using Inversify for dependency injection
- Error handling middleware and custom error types
- Environment-based configuration

## Prerequisites

- Node.js 14+
- MongoDB
- Redis
- Cloudinary account

## Environment Variables

Create a `.env` file with the following:

- PORT
- DB_CONNECTION_STRING
- REDIS_HOST
- REDIS_PORT
- REDIS_PASSWORD
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- CLOUDINARY_CLOUD_NAME

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/image-processing-service.git
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

## POSTMAN COLLECTION
https://www.postman.com/ani80/workspace/image-processing-service/collection/16362923-b7a7deae-c48a-41fc-b745-7ea9e3122a3f?action=share&creator=16362923

## TECHNICAL DOCUMENTATION
https://docs.google.com/document/d/1z--10hrzBkxZyDrScX5rw_45twwwHbc8Ys7ZhtEkPlU/edit?usp=sharing

## API URL
https://image-processing-service-6z96.onrender.com

## SWAGGER
https://image-processing-service-6z96.onrender.com/api-docs
