import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  initialized: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      set({ user: data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      set({ user: data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, isLoading: false, initialized: true });
  },

  fetchUser: async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      set({ user: data.user, isLoading: false, initialized: true });
    } catch {
      set({ user: null, isLoading: false, initialized: true });
    }
  },
  setUser: (userData) => set((state) => ({ 
    user: state.user ? { ...state.user, ...userData } : userData 
  })),
}));