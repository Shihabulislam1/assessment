import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      set({ user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      set({ user: data.user });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, isLoading: false });
  },

  fetchUser: async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      set({ user: data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));