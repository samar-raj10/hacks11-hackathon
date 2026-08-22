import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { connectDatabase } from './config/db.js';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import reportsRouter from './routes/reports.js';
import advisoryRoutes from './routes/advisoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const preferredPort = Number(process.env.PORT ?? 4000);
const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:4173';

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

app.get('/health', (_req, res) => {
  res.json({ service: 'campusshield-backend', status: 'ok', phase: 'auth-enabled' });
});

app.get('/api/health', (_req, res) => {
  res.json({ api: 'ok', analyticsUrl: process.env.PYTHON_ANALYTICS_URL ?? 'http://localhost:8000' });
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/advisories', advisoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

const createSocketServer = () => {
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: true, credentials: true } });

  io.on('connection', (socket) => {
    socket.emit('campusshield:hello', { message: 'CampusShield socket connected.' });
  });

  return httpServer;
};

const listenWithFallback = (port: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = createSocketServer();

    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' && port < 4100) {
        server.close(() => resolve(listenWithFallback(port + 1)));
        return;
      }

      reject(error);
    });

    server.listen(port, () => {
      console.log(`CAMPUSSHIELD backend listening on http://localhost:${port}`);
      resolve(port);
    });
  });
};

const startServer = async () => {
  await connectDatabase();

  try {
    await listenWithFallback(preferredPort);
  } catch (error) {
    console.error('Failed to start backend server.', error);
    process.exit(1);
  }
};

startServer();
