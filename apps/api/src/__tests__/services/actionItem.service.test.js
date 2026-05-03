import { jest } from '@jest/globals';

const mockPrisma = {
  actionItem: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.unstable_mockModule('../../config/db.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../../services/audit.service.js', () => ({
  createAuditLog: jest.fn().mockResolvedValue({}),
}));

const {
  createActionItem,
  listActionItems,
  getActionItemById,
  updateActionItem,
  deleteActionItem,
} = await import('../../services/actionItem.service.js');

describe('ActionItem Service', () => {
  const userId = 'user123';
  const workspaceId = 'ws123';
  const itemId = 'item123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createActionItem', () => {
    it('creates an action item with priority', async () => {
      const data = { title: 'Fix bug', priority: 'HIGH', assigneeId: 'dev1' };
      mockPrisma.actionItem.create.mockResolvedValue({ id: itemId, ...data });

      const result = await createActionItem(workspaceId, userId, data);

      expect(mockPrisma.actionItem.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ priority: 'HIGH' }),
      }));
      expect(result.id).toBe(itemId);
    });
  });

  describe('listActionItems', () => {
    it('filters by status and assignee', async () => {
      mockPrisma.actionItem.findMany.mockResolvedValue([]);
      
      await listActionItems(workspaceId, { status: 'DONE', assigneeId: 'dev1' });

      expect(mockPrisma.actionItem.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          status: 'DONE',
          assigneeId: 'dev1',
        }),
      }));
    });
  });

  describe('updateActionItem', () => {
    it('updates status and priority', async () => {
      mockPrisma.actionItem.update.mockResolvedValue({ id: itemId, status: 'IN_PROGRESS' });

      const result = await updateActionItem(workspaceId, itemId, userId, { status: 'IN_PROGRESS' });

      expect(mockPrisma.actionItem.update).toHaveBeenCalled();
      expect(result.status).toBe('IN_PROGRESS');
    });
  });
});
