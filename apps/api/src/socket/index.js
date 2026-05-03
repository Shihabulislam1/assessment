import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import corsConfig, { socketCorsConfig } from '../config/cors.js';
import prisma from '../config/db.js';

let io;
const onlineUsers = new Map(); // workspaceId -> Map(userId -> Set(socketId))

const getOptionalMultilineEnv = (name) => {
  const value = process.env[name];
  if (!value) return null;
  return value.replace(/\\n/g, '\n');
};

let JWT_PUBLIC_KEY = getOptionalMultilineEnv('JWT_PUBLIC_KEY');
const JWT_ISSUER = process.env.JWT_ISSUER || 'fredocloud';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'fredocloud-api';

export const initSocket = (httpServer) => {
  if (!JWT_PUBLIC_KEY) {
    console.warn('WARNING: JWT_PUBLIC_KEY is not set. Socket authentication will fail.');
  }

  io = new Server(httpServer, {
    cors: socketCorsConfig,
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      // Primary: short-lived token fetched via /api/auth/socket-token
      // Fallback: access_token cookie (works in same-origin / local dev)
      let token = socket.handshake.auth?.token;
      if (!token) {
        const cookies = cookie.parse(socket.handshake.headers.cookie || '');
        token = cookies.access_token;
      }

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

    socket.on('join-workspace', async (workspaceId) => {
      try {
        // Authorization: verify the user is a member of this workspace
        const membership = await prisma.workspaceMember.findUnique({
          where: { userId_workspaceId: { userId, workspaceId } },
          select: { userId: true },
        });

        if (!membership) {
          socket.emit('workspace:error', { workspaceId, message: 'Not authorized to join this workspace' });
          console.warn(`Unauthorized join-workspace attempt: user=${userId} workspace=${workspaceId}`);
          return;
        }

        socket.join(`workspace:${workspaceId}`);
        
        // Update presence
        if (!onlineUsers.has(workspaceId)) {
          onlineUsers.set(workspaceId, new Map());
        }
        
        const workspaceMap = onlineUsers.get(workspaceId);
        if (!workspaceMap.has(userId)) {
          workspaceMap.set(userId, new Set());
        }
        
        workspaceMap.get(userId).add(socket.id);
        
        // Notify others in workspace
        io.to(`workspace:${workspaceId}`).emit('online-users', Array.from(workspaceMap.keys()));
        
        console.log(`User ${userId} joined workspace ${workspaceId} (Socket: ${socket.id})`);
      } catch (err) {
        console.error(`Error in join-workspace handler: ${err.message}`);
        socket.emit('workspace:error', { workspaceId, message: 'Internal server error' });
      }
    });

    socket.on('leave-workspace', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      
      // Update presence
      if (onlineUsers.has(workspaceId)) {
        const workspaceMap = onlineUsers.get(workspaceId);
        if (workspaceMap.has(userId)) {
          workspaceMap.get(userId).delete(socket.id);
          
          if (workspaceMap.get(userId).size === 0) {
            workspaceMap.delete(userId);
            io.to(`workspace:${workspaceId}`).emit('online-users', Array.from(workspaceMap.keys()));
          }
        }
      }
      
      console.log(`User ${userId} left workspace ${workspaceId} (Socket: ${socket.id})`);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from socket ${socket.id}`);
      
      // Cleanup presence from all workspaces
      onlineUsers.forEach((workspaceMap, workspaceId) => {
        if (workspaceMap.has(userId)) {
          const sockets = workspaceMap.get(userId);
          if (sockets.has(socket.id)) {
            sockets.delete(socket.id);
            
            if (sockets.size === 0) {
              workspaceMap.delete(userId);
              io.to(`workspace:${workspaceId}`).emit('online-users', Array.from(workspaceMap.keys()));
            }
          }
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
