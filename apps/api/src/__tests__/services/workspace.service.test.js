import { jest } from '@jest/globals';

const mockPrisma = {
  workspace: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workspaceMember: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.unstable_mockModule('../../config/db.js', () => ({
  default: mockPrisma,
}));

// Mock audit service to avoid actual creation
jest.unstable_mockModule('../../services/audit.service.js', () => ({
  createAuditLog: jest.fn().mockResolvedValue({}),
}));

const {
  createWorkspace,
  listUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  updateMemberRole,
  removeMember,
} = await import('../../services/workspace.service.js');

describe('Workspace Service', () => {
  const userId = 'user123';
  const workspaceId = 'ws123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createWorkspace', () => {
    it('creates a workspace and adds the creator as ADMIN', async () => {
      const data = { name: 'New Workspace', description: 'Test description' };
      const createdWorkspace = { id: workspaceId, ...data };
      mockPrisma.workspace.create.mockResolvedValue(createdWorkspace);

      const result = await createWorkspace(userId, data);

      expect(mockPrisma.workspace.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: data.name,
          members: { create: { userId, role: 'ADMIN' } },
        }),
        include: expect.any(Object),
      });
      expect(result).toEqual(createdWorkspace);
    });
  });

  describe('getWorkspaceById', () => {
    it('returns workspace if found', async () => {
      const workspace = { id: workspaceId, name: 'Test WS' };
      mockPrisma.workspace.findUnique.mockResolvedValue(workspace);

      const result = await getWorkspaceById(workspaceId);

      expect(mockPrisma.workspace.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: workspaceId },
      }));
      expect(result).toEqual(workspace);
    });

    it('throws NotFound error if workspace does not exist', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null);

      await expect(getWorkspaceById(workspaceId)).rejects.toThrow('Workspace not found');
    });
  });

  describe('updateWorkspace', () => {
    it('updates workspace if user is ADMIN', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ userId, workspaceId, role: 'ADMIN' });
      mockPrisma.workspace.update.mockResolvedValue({ id: workspaceId, name: 'Updated' });

      const result = await updateWorkspace(workspaceId, userId, { name: 'Updated' });

      expect(mockPrisma.workspace.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('throws Forbidden error if user is not ADMIN', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ userId, workspaceId, role: 'MEMBER' });

      await expect(updateWorkspace(workspaceId, userId, { name: 'Updated' }))
        .rejects.toThrow('You do not have administrative privileges');
    });
  });

  describe('inviteMember', () => {
    it('creates a new membership and notification', async () => {
      const inviteData = { email: 'guest@example.com', role: 'MEMBER' };
      const invitee = { id: 'guest123', email: inviteData.email };
      
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ userId, workspaceId, role: 'ADMIN' });
      mockPrisma.user.findUnique.mockResolvedValue(invitee);
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          workspaceMember: { create: jest.fn().mockResolvedValue({ ...invitee, id: 'mem123' }) },
          notification: { create: jest.fn().mockResolvedValue({}) },
        };
        return callback(mockTx);
      });

      const result = await inviteMember(workspaceId, userId, inviteData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: inviteData.email } });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.id).toBe('mem123');
    });

    it('throws Conflict error if user is already a member', async () => {
      mockPrisma.workspaceMember.findUnique.mockResolvedValue({ userId, workspaceId, role: 'ADMIN' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'guest123' });
      
      const prismaError = new Error('Unique constraint failed');
      prismaError.code = 'P2002';
      mockPrisma.$transaction.mockRejectedValue(prismaError);

      await expect(inviteMember(workspaceId, userId, { email: 'guest@example.com' }))
        .rejects.toThrow('User is already a member of this workspace');
    });
  });
});
