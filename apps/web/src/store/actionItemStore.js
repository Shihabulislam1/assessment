import { create } from 'zustand';
import { apiFetch } from '../lib/api';

/**
 * @typedef {Object} ActionItemStore
 * @property {Array} items
 * @property {Object|null} currentItem
 * @property {boolean} isLoading
 * @property {string|null} error
 */

export const useActionItemStore = create((set) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  fetchItems: async (workspaceId, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Filter out 'all' and empty string values as they represent no filter
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== 'all' && v !== '')
      );
      const params = new URLSearchParams(cleanFilters).toString();
      const data = await apiFetch(`/api/workspaces/${workspaceId}/items${params ? `?${params}` : ''}`);
      set({ items: data.items, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  createItem: async (workspaceId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/items`, { method: 'POST', body: JSON.stringify(payload) });
      set((state) => ({ items: [data.item, ...state.items], isLoading: false }));
      return data.item;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateItem: async (workspaceId, itemId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/items/${itemId}`, { method: 'PUT', body: JSON.stringify(payload) });
      set((state) => ({
        items: state.items.map((i) => (i.id === itemId ? data.item : i)),
        currentItem: data.item,
        isLoading: false,
      }));
      return data.item;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteItem: async (workspaceId, itemId) => {
    set({ isLoading: true, error: null });
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/items/${itemId}`, { method: 'DELETE' });
      set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
        currentItem: null,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  reset: () => set({ items: [], currentItem: null, isLoading: false, error: null }),
}));