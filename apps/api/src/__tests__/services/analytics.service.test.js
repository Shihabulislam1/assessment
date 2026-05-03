import { jest } from '@jest/globals';

const mockPrisma = {
  goal: {
    count: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  actionItem: {
    count: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  workspaceMember: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.unstable_mockModule('../../config/db.js', () => ({
  default: mockPrisma,
}));

const {
  getSummary,
  getGoalCompletionOverTime,
  getStatusDistribution,
  getPriorityDistribution,
  getExportData,
} = await import('../../services/analytics.service.js');

describe('Analytics Service', () => {
  const workspaceId = 'ws123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('calculates completion rate and counts correctly', async () => {
      mockPrisma.goal.count.mockResolvedValueOnce(10); // total
      mockPrisma.goal.count.mockResolvedValueOnce(6);  // completed
      mockPrisma.goal.count.mockResolvedValueOnce(2);  // overdue
      mockPrisma.actionItem.count.mockResolvedValueOnce(5); // weekly velocity
      mockPrisma.workspaceMember.count.mockResolvedValueOnce(3); // members
      mockPrisma.actionItem.count.mockResolvedValueOnce(4); // active items

      const result = await getSummary(workspaceId);

      expect(result.totalGoals).toBe(10);
      expect(result.completionRate).toBe(60);
      expect(result.itemsDoneThisWeek).toBe(5);
    });
  });

  describe('getGoalCompletionOverTime', () => {
    it('aggregates completed goals by month', async () => {
      const now = new Date();
      const lastMonth = new Date(now);
      lastMonth.setMonth(now.getMonth() - 1);
      
      mockPrisma.goal.findMany.mockResolvedValue([
        { updatedAt: now },
        { updatedAt: now },
        { updatedAt: lastMonth },
      ]);

      const result = await getGoalCompletionOverTime(workspaceId);

      const currentMonthKey = now.toLocaleString('default', { month: 'short' });
      const lastMonthKey = lastMonth.toLocaleString('default', { month: 'short' });
      
      const currentMonthData = result.find(d => d.month === currentMonthKey);
      const lastMonthData = result.find(d => d.month === lastMonthKey);

      expect(currentMonthData.completed).toBe(2);
      expect(lastMonthData.completed).toBe(1);
    });
  });

  describe('getExportData', () => {
    it('retrieves goals, items, and members', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([{ id: 'g1' }]);
      mockPrisma.actionItem.findMany.mockResolvedValue([{ id: 'i1' }]);
      mockPrisma.workspaceMember.findMany.mockResolvedValue([{ id: 'm1' }]);

      const result = await getExportData(workspaceId);

      expect(result.goals).toHaveLength(1);
      expect(result.items).toHaveLength(1);
      expect(result.members).toHaveLength(1);
    });
  });
});
