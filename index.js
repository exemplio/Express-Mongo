import express from 'express';
import cors from 'cors';
import connectDB from './database/conexion.mjs';
import 'dotenv/config';
import http from 'http';

import dataRouter from './routes/apiRoutes.js';
import { swaggerUi, specs } from './swaggerConfig.js';
import { initChatWebSocket } from './routes/webSocket.js';

const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use('/api', dataRouter);
app.get('/ping', (_req, res) => res.send('pong'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(specs));

app.use((err, req, res, next) => {
  console.error(err?.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

initChatWebSocket(server);

server.listen(PORT, () => {
  console.log(`HTTP server on http://localhost:${PORT}`);
  console.log(`WS endpoint on ws://localhost:${PORT}/ws`);
  console.log(`Android emulator WS URL: ws://10.0.2.2:${PORT}/ws`);
});