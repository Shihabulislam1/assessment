import { jest } from '@jest/globals';

const mockPrisma = {
  announcement: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  comment: {
    create: jest.fn(),
  },
  reaction: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
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
  createAnnouncement,
  listAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  createComment,
  toggleReaction,
} = await import('../../services/announcement.service.js');

const { extractMentions } = await import('../../utils/mentions.js');
const notificationService = await import('../../services/notification.service.js');

describe('Announcement Service', () => {
  const userId = 'user123';
  const workspaceId = 'ws123';
  const annId = 'ann123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAnnouncement', () => {
    it('creates announcement and sanitizes content', async () => {
      const data = { title: 'News', content: '<b>Hello</b><script>alert(1)</script>' };
      const createdAnn = { id: annId, ...data, content: '<b>Hello</b>', author: { name: 'Admin' } };
      mockPrisma.announcement.create.mockResolvedValue(createdAnn);

      const result = await createAnnouncement(workspaceId, userId, data);

      expect(mockPrisma.announcement.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ content: '<b>Hello</b>' }),
      }));
      expect(result.id).toBe(annId);
    });
  });

  describe('toggleReaction', () => {
    it('adds reaction if not present', async () => {
      const emoji = '👍';
      mockPrisma.announcement.findFirst.mockResolvedValue({ id: annId });
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          reaction: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 'r1', emoji }),
          },
        };
        return callback(mockTx);
      });

      const result = await toggleReaction(workspaceId, annId, userId, { emoji });

      expect(result.emoji).toBe(emoji);
      expect(result.removed).toBeUndefined();
    });

    it('removes reaction if already present', async () => {
      const emoji = '👍';
      mockPrisma.announcement.findFirst.mockResolvedValue({ id: annId });
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          reaction: {
            findUnique: jest.fn().mockResolvedValue({ id: 'r1', emoji }),
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(mockTx);
      });

      const result = await toggleReaction(workspaceId, annId, userId, { emoji });

      expect(result.removed).toBe(true);
    });
  });
});
