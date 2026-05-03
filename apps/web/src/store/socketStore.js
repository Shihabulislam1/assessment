import { create } from 'zustand';

export const useSocketStore = create((set) => ({
  onlineUsers: [],
  isConnected: false,
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  setIsConnected: (connected) => set({ isConnected: connected }),
}));
