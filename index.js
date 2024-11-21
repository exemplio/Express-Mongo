import express, { json } from 'express';
import cors from 'cors';
const app = express();
import { swaggerUi, specs } from './swaggerConfig.js';
import loginRoutes from './routes/loginRoutes.js';
import dotenv from 'dotenv';

app.use(json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Hola mundo');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use("/users", loginRoutes);

const env= dotenv.config().parsed;

app.listen(env?.PORT, () => {
    console.log('Servidor activo');
    console.log(`http://localhost:${env?.PORT}`);
});