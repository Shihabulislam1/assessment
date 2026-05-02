import { create } from 'zustand';
import { apiFetch } from '../lib/api';

/**
 * @typedef {Object} NotificationStore
 * @property {Array} notifications
 * @property {number} unreadCount
 * @property {boolean} isLoading
 * @property {string|null} error
 */

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/notifications');
      set({ notifications: data.notifications || [], unreadCount: data.unreadCount || 0, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    await apiFetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await apiFetch('/api/notifications/read-all', { method: 'POST' });
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  reset: () => set({ notifications: [], unreadCount: 0, isLoading: false, error: null }),
}));