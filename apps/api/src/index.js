import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { initSocket } from './socket/index.js';
import { NotFound } from './utils/AppError.js';
import corsConfig from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authLimiter, apiLimiter, refreshLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/auth.routes.js';
import workspaceRoutes from './routes/workspace.routes.js';
import goalRoutes from './routes/goal.routes.js';
import actionItemRoutes from './routes/actionItem.routes.js';
import announcementRoutes from './routes/announcement.routes.js';
import auditRoutes from './routes/audit.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'res.cloudinary.com'],
    }
  }
}));
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/', apiLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/refresh', refreshLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:workspaceId/goals', goalRoutes);
app.use('/api/workspaces/:workspaceId/items', actionItemRoutes);
app.use('/api/workspaces/:workspaceId/announcements', announcementRoutes);
app.use('/api/workspaces/:workspaceId/audit-log', auditRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workspaces/:workspaceId/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res, next) => {
  next(new NotFound('Route not found'));
});

app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});