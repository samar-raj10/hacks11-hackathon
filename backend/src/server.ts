import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import advisoryRoutes from './routes/advisoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

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
  res.json({ service: 'campusshield-backend', status: 'ok', phase: 'auth-and-reports' });
});

app.get('/api/health', (_req, res) => {
  res.json({ api: 'ok', analyticsUrl: process.env.PYTHON_ANALYTICS_URL ?? 'http://localhost:8000' });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/advisories', advisoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: frontendUrl, credentials: true } });

io.on('connection', (socket) => {
  socket.emit('campusshield:hello', { message: 'Socket.IO scaffold ready' });
});

async function start() {
  await connectDatabase();
  httpServer.listen(port, () => {
    console.log(`CAMPUSSHIELD backend listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start CAMPUSSHIELD backend', error);
  process.exit(1);
});
