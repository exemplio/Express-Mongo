import express from 'express';
import cors from 'cors';
import connectDB from './database/conexion.mjs';
import 'dotenv/config';
import dataRouter from './routes/dataRoutes.js';
import { swaggerUi, specs } from './swaggerConfig.js';

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/data', dataRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});