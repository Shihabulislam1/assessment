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

  subscribeToSocket: (socket) => {
    socket.on('goal:created', (goal) => {
      set((state) => ({ goals: [goal, ...state.goals] }));
    });
    socket.on('goal:updated', (goal) => {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === goal.id ? goal : g)),
        currentGoal: state.currentGoal?.id === goal.id ? goal : state.currentGoal,
      }));
    });
    socket.on('goal:deleted', (goalId) => {
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== goalId),
        currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
      }));
    });
    socket.on('milestone:created', ({ goalId, milestone }) => {
      set((state) => {
        const updateGoal = (g) => g.id === goalId ? { ...g, milestones: [...(g.milestones || []), milestone] } : g;
        return {
          goals: state.goals.map(updateGoal),
          currentGoal: state.currentGoal?.id === goalId ? updateGoal(state.currentGoal) : state.currentGoal,
        };
      });
    });
    socket.on('milestone:updated', ({ milestoneId, milestone }) => {
      set((state) => {
        const updateGoal = (g) => ({
          ...g,
          milestones: g.milestones?.map((m) => (m.id === milestoneId ? milestone : m)),
        });
        return {
          goals: state.goals.map(updateGoal),
          currentGoal: state.currentGoal ? updateGoal(state.currentGoal) : null,
        };
      });
    });
    socket.on('milestone:deleted', ({ milestoneId }) => {
      set((state) => {
        const updateGoal = (g) => ({
          ...g,
          milestones: g.milestones?.filter((m) => m.id !== milestoneId),
        });
        return {
          goals: state.goals.map(updateGoal),
          currentGoal: state.currentGoal ? updateGoal(state.currentGoal) : null,
        };
      });
    });
    socket.on('activity:created', ({ goalId, activity }) => {
      set((state) => {
        if (state.currentGoal?.id === goalId) {
          return {
            currentGoal: {
              ...state.currentGoal,
              activities: [activity, ...(state.currentGoal.activities || [])],
            },
          };
        }
        return state;
      });
    });
  },

  unsubscribeFromSocket: (socket) => {
    socket.off('goal:created');
    socket.off('goal:updated');
    socket.off('goal:deleted');
    socket.off('milestone:created');
    socket.off('milestone:updated');
    socket.off('milestone:deleted');
    socket.off('activity:created');
  },
}));