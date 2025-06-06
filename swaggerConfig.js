import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Documentación de la API de tu proyecto Node.js',
        },
    },
    apis: ['./routes/dataRoutes.js'], // Ruta al archivo donde están definidas tus rutas
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };