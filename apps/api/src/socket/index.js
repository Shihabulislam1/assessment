import { Server } from 'socket.io';
import cors from '../config/cors.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: cors,
  });

  io.on('connection', (socket) => {
    console.log('Socket.io client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected:', socket.id);
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
