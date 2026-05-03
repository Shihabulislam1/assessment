import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import corsConfig from '../config/cors.js';

let io;
const onlineUsers = new Map(); // workspaceId -> Set(userIds)

const getRequiredMultilineEnv = (name) => {
  const value = process.env[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.replace(/\\n/g, '\n');
};

const JWT_PUBLIC_KEY = getRequiredMultilineEnv('JWT_PUBLIC_KEY');
const JWT_ISSUER = process.env.JWT_ISSUER || 'fredocloud';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'fredocloud-api';

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: corsConfig,
    cookie: true
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      const token = cookies.access_token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
        algorithms: ['RS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });

      socket.data.userId = decoded.sub;
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected via socket ${socket.id}`);
    socket.join(`user:${userId}`);

    socket.on('join-workspace', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      
      // Update presence
      if (!onlineUsers.has(workspaceId)) {
        onlineUsers.set(workspaceId, new Set());
      }
      onlineUsers.get(workspaceId).add(userId);
      
      // Notify others in workspace
      io.to(`workspace:${workspaceId}`).emit('online-users', Array.from(onlineUsers.get(workspaceId)));
      
      console.log(`User ${userId} joined workspace ${workspaceId}`);
    });

    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      
      // Update presence
      if (onlineUsers.has(workspaceId)) {
        onlineUsers.get(workspaceId).delete(userId);
        io.to(`workspace:${workspaceId}`).emit('online-users', Array.from(onlineUsers.get(workspaceId)));
      }
      
      console.log(`User ${userId} left workspace ${workspaceId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from socket ${socket.id}`);
      
      // Cleanup presence from all workspaces
      onlineUsers.forEach((users, workspaceId) => {
        if (users.has(userId)) {
          users.delete(userId);
          io.to(`workspace:${workspaceId}`).emit('online-users', Array.from(users));
        }
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
