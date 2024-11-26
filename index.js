import express, { json } from 'express';
import cors from 'cors';
const app = express();
import { swaggerUi, specs } from './swaggerConfig.js';

import loginRoutes from './routes/loginRoutes.js';

app.use(json());
app.use(cors());
app.get('/', (req, res) => {
    res.send('Hola mundo');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use("/users", loginRoutes);

app.listen(6500, () => {
    console.log('Servidor activo');
    console.log(`http://localhost:${6500}`);
});