import { create } from 'zustand';
import { apiFetch } from '../lib/api';

/**
 * @typedef {Object} GoalStore
 * @property {Array} goals
 * @property {Object|null} currentGoal
 * @property {boolean} isLoading
 * @property {string|null} error
 */

export const useGoalStore = create((set) => ({
  goals: [],
  currentGoal: null,
  isLoading: false,
  error: null,

  fetchGoals: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/goals`);
      set({ goals: data.goals, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchGoalById: async (workspaceId, goalId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/goals/${goalId}`);
      set({ currentGoal: data.goal, isLoading: false });
      return data.goal;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  createGoal: async (workspaceId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/goals`, { method: 'POST', body: JSON.stringify(payload) });
      set((state) => ({ goals: [data.goal, ...state.goals], isLoading: false }));
      return data.goal;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateGoal: async (workspaceId, goalId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/workspaces/${workspaceId}/goals/${goalId}`, { method: 'PUT', body: JSON.stringify(payload) });
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goalId ? data.goal : g)),
        currentGoal: data.goal,
        isLoading: false,
      }));
      return data.goal;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteGoal: async (workspaceId, goalId) => {
    set({ isLoading: true, error: null });
    try {
      await apiFetch(`/api/workspaces/${workspaceId}/goals/${goalId}`, { method: 'DELETE' });
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId),
        currentGoal: null,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  reset: () => set({ goals: [], currentGoal: null, isLoading: false, error: null }),
}));