import { create } from 'zustand';
import { apiFetch } from '../lib/api';

/**
 * @typedef {Object} WorkspaceStore
 * @property {Array} workspaces
 * @property {Object|null} currentWorkspace
 * @property {boolean} isLoading
 * @property {string|null} error
 */

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,
  workspacesInit: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/workspaces');
      set({ workspaces: data.workspaces, isLoading: false, workspacesInit: true });
    } catch (err) {
      set({ error: err.message, isLoading: false, workspacesInit: true });
    }
  },

  createWorkspace: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/workspaces', { method: 'POST', body: JSON.stringify(payload) });
      set((state) => ({
        workspaces: [data.workspace, ...state.workspaces],
        currentWorkspace: data.workspace,
        isLoading: false,
      }));
      return data.workspace;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  reset: () => set({ workspaces: [], currentWorkspace: null, isLoading: false, error: null, workspacesInit: false }),
}));