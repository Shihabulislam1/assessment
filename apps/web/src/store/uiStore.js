import { create } from 'zustand';

/**
 * @typedef {Object} UIStore
 * @property {boolean} sidebarOpen
 * @property {string|null} activeModal
 * @property {Object|null} modalData
 * @property {string} viewMode - 'list' | 'kanban'
 */

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,
  modalData: null,
  viewMode: 'list',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  setViewMode: (mode) => set({ viewMode: mode }),
}));