import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.get('/health', (_req, res) => {
  res.json({ service: 'campusshield-backend', status: 'ok', phase: 'phase-1-scaffold' });
});

app.get('/api/health', (_req, res) => {
  res.json({ api: 'ok', analyticsUrl: process.env.PYTHON_ANALYTICS_URL ?? 'http://localhost:8000' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: frontendUrl, credentials: true } });

io.on('connection', (socket) => {
  socket.emit('campusshield:hello', { message: 'Socket.IO scaffold ready' });
});

httpServer.listen(port, () => {
  console.log(`CAMPUSSHIELD backend listening on http://localhost:${port}`);
});
