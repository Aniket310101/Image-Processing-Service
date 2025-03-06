import * as dotenv from 'dotenv';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import "./modules/image-processor/controllers/image-processor.controller";
import bodyParser from 'body-parser';
import { ErrorMiddleware } from './common/errors/error.middleware';
import CommonBootrapper from './common/common.bootstrapper';
import ImageProcessorBootstrapper from './modules/image-processor/image-processor.bootstrapper';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();
const port = process.env.PORT;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image Processing Service API',
      version: '1.0.0',
      description: 'API documentation for Image Processing Service',
    },
    servers: [
      {
        url: `${process.env.BASE_URL}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/modules/**/controllers/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const globalContainer = new Container();
CommonBootrapper.initialize(globalContainer);
ImageProcessorBootstrapper.initialize(globalContainer);
const server = new InversifyExpressServer(globalContainer);

server.setConfig((app) => {
    app.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );
    app.use(bodyParser.json({ limit: '50MB' }));

    // Swagger UI setup
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/theme-material.css'
    }));

    // Optional: Expose swagger.json endpoint
    app.get('/swagger.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
});
server.setErrorConfig((appForErrorConfig) => {
  appForErrorConfig.use(ErrorMiddleware);
});

const app = server.build();

app.listen(port, () => {
  console.log(`Server is running at ${process.env.BASE_URL}`);
  console.log(`Swagger documentation available at ${process.env.BASE_URL}/api-docs`);
});
