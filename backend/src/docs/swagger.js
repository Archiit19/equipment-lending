import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Equipment Lending API',
      version: '1.0.0',
      description: 'API for School Equipment Lending Portal'
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [] // keeping inline for brevity
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
