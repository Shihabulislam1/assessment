'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function Home() {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>FredoCloud</h1>
      <p>Socket.io connection test</p>
    </div>
  );
}
