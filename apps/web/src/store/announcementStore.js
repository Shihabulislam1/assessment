import { create } from 'zustand';
import { apiFetch } from '../lib/api';

/**
 * @typedef {Object} AnnouncementStore
 * @property {Array} announcements
 * @property {Object|null} currentAnnouncement
 * @property {boolean} isLoading
 * @property {string|null} error
 */

export const useAnnouncementStore = create((set) => ({
  announcements: [],
  currentAnnouncement: null,
  isLoading: false,
  error: null,

  fetchAnnouncements: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/announcements`);
      set({ announcements: data.announcements, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAnnouncementById: async (workspaceId, id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/announcements/${id}`);
      set({ currentAnnouncement: data.announcement, isLoading: false });
      return data.announcement;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createAnnouncement: async (workspaceId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/announcements`, { method: 'POST', body: JSON.stringify(payload) });
      set((state) => ({ announcements: [data.announcement, ...state.announcements], isLoading: false }));
      return data.announcement;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateAnnouncement: async (workspaceId, id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/announcements/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      set((state) => ({
        announcements: state.announcements.map((a) => (a.id === id ? data.announcement : a)),
        currentAnnouncement: data.announcement,
        isLoading: false,
      }));
      return data.announcement;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteAnnouncement: async (workspaceId, id) => {
    set({ isLoading: true, error: null });
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/announcements/${id}`, { method: 'DELETE' });
      set((state) => ({
        announcements: state.announcements.filter((a) => a.id !== id),
        currentAnnouncement: null,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addComment: async (workspaceId, announcementId, payload) => {
    const data = await apiFetch(`/api/workspaces/${workspaceId}/announcements/${announcementId}/comments`, { method: 'POST', body: JSON.stringify(payload) });
    return data.comment;
  },

  toggleReaction: async (workspaceId, announcementId, emoji) => {
    const data = await apiFetch(`/api/workspaces/${workspaceId}/announcements/${announcementId}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) });
    return data;
  },

  reset: () => set({ announcements: [], currentAnnouncement: null, isLoading: false, error: null }),

  subscribeToSocket: (socket) => {
    socket.on('announcement:created', (announcement) => {
      set((state) => ({ announcements: [announcement, ...state.announcements] }));
    });
    socket.on('announcement:updated', (announcement) => {
      set((state) => ({
        announcements: state.announcements.map((a) => (a.id === announcement.id ? announcement : a)),
        currentAnnouncement: state.currentAnnouncement?.id === announcement.id ? announcement : state.currentAnnouncement,
      }));
    });
    socket.on('announcement:deleted', (id) => {
      set((state) => ({
        announcements: state.announcements.filter((a) => a.id !== id),
        currentAnnouncement: state.currentAnnouncement?.id === id ? null : state.currentAnnouncement,
      }));
    });
    socket.on('comment:created', ({ announcementId, comment }) => {
      set((state) => {
        const updateAnnouncement = (a) => a.id === announcementId ? { ...a, comments: [...(a.comments || []), comment] } : a;
        return {
          announcements: state.announcements.map(updateAnnouncement),
          currentAnnouncement: state.currentAnnouncement?.id === announcementId ? updateAnnouncement(state.currentAnnouncement) : state.currentAnnouncement,
        };
      });
    });
  },

  unsubscribeFromSocket: (socket) => {
    socket.off('announcement:created');
    socket.off('announcement:updated');
    socket.off('announcement:deleted');
    socket.off('comment:created');
  },
}));