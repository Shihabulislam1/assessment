import { jest } from '@jest/globals';

const mockPrisma = {
  goal: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workspaceMember: {
    findUnique: jest.fn(),
  },
  milestone: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  activity: {
    create: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
};

jest.unstable_mockModule('../../config/db.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../../services/audit.service.js', () => ({
  createAuditLog: jest.fn().mockResolvedValue({}),
}));

jest.unstable_mockModule('../../services/notification.service.js', () => ({
  createNotification: jest.fn().mockResolvedValue({}),
}));

jest.unstable_mockModule('../../utils/mentions.js', () => ({
  extractMentions: jest.fn().mockReturnValue([]),
}));

const {
  createGoal,
  listGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  createActivity,
} = await import('../../services/goal.service.js');

const { extractMentions } = await import('../../utils/mentions.js');
const notificationService = await import('../../services/notification.service.js');

describe('Goal Service', () => {
  const userId = 'user123';
  const workspaceId = 'ws123';
  const goalId = 'goal123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    it('creates a goal if user is ADMIN', async () => {
      const data = { title: 'New Goal', description: 'Test' };
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'ADMIN' });
      mockPrisma.goal.create.mockResolvedValue({ id: goalId, ...data });

      const result = await createGoal(workspaceId, userId, data);

      expect(mockPrisma.goal.create).toHaveBeenCalled();
      expect(result.id).toBe(goalId);
    });

    it('throws Forbidden if user is not ADMIN', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });
      await expect(createGoal(workspaceId, userId, { title: 'No' }))
        .rejects.toThrow('Only administrators can perform this action');
    });
  });

  describe('createActivity', () => {
    it('creates activity and handles mentions', async () => {
      const content = 'Hello <script>alert(1)</script> @Alice';
      const sanitizedContent = 'Hello  @Alice';
      const goal = { id: goalId, title: 'Test Goal' };
      const activity = { id: 'act1', content: sanitizedContent, user: { name: 'Bob' } };

      mockPrisma.goal.findUnique.mockResolvedValue(goal);
      mockPrisma.activity.create.mockResolvedValue(activity);
      extractMentions.mockReturnValue(['Alice']);
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'alice123', name: 'Alice' }]);

      const result = await createActivity(workspaceId, goalId, userId, { content });

      expect(mockPrisma.activity.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ content: sanitizedContent }),
      }));
      expect(notificationService.createNotification).toHaveBeenCalled();
      expect(result.content).toBe(sanitizedContent);
    });
  });

  describe('updateMilestone', () => {
    it('updates milestone progress', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ role: 'MEMBER' });
      mockPrisma.milestone.update.mockResolvedValue({ id: 'm1', progress: 50 });

      const result = await updateMilestone(workspaceId, 'm1', userId, { progress: 50 });

      expect(mockPrisma.milestone.update).toHaveBeenCalled();
      expect(result.progress).toBe(50);
    });
  });
});
