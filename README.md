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
