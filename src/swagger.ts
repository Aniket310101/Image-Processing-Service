import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing Service API',
      version: '1.0.0',
      description: 'API documentation for Image Processing Service',
    },
    servers: [
      {
        url: process.env.BASE_URL,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/modules/**/controllers/*.ts'], // files containing annotations
};

export const swaggerSpec = swaggerJsdoc(options);