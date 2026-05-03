'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSocketStore } from '@/store/socketStore';

export function useSocket(workspaceId) {
  const socketRef = useRef(null);
  const { setIsConnected, setOnlineUsers } = useSocketStore();

  useEffect(() => {
    if (!workspaceId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      socket.emit('join-workspace', workspaceId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    // Handle visibility change for reconnection
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !socket.connected) {
        socket.connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (socket.connected) {
        socket.emit('leave-workspace', workspaceId);
      }
      socket.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [workspaceId, setIsConnected, setOnlineUsers]);

  return socketRef;
}
