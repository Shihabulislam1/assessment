'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSocketStore } from '@/store/socketStore';
import { apiFetch } from '@/lib/api';

export function useSocket(workspaceId) {
  const socketRef = useRef(null);
  const { setIsConnected, setOnlineUsers } = useSocketStore();

  useEffect(() => {
    if (!workspaceId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    let cancelled = false;

    const connect = async () => {
      // Fetch a short-lived socket auth token via the normal HTTP channel
      // (where cookies work reliably). This avoids cross-domain cookie issues
      // that occur when the socket connects to a different subdomain in production.
      let authToken;
      try {
        const data = await apiFetch('/api/auth/socket-token');
        authToken = data?.token;
      } catch (err) {
        console.error('Failed to fetch socket token:', err.message);
        return;
      }

      if (cancelled) return;

      const socket = io(socketUrl, {
        withCredentials: true,
        auth: { token: authToken },
        transports: ['polling', 'websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        socket.emit('join-workspace', workspaceId);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('online-users', (users) => {
        setOnlineUsers(users);
      });
    };

    connect();

    // Handle visibility change for reconnection
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socketRef.current) {
        if (socketRef.current.connected) {
          socketRef.current.emit('leave-workspace', workspaceId);
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [workspaceId, setIsConnected, setOnlineUsers]);

  return socketRef;
}
