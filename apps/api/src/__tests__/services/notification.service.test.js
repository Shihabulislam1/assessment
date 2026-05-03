import { jest } from '@jest/globals';

const mockPrisma = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockIO = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

jest.unstable_mockModule('../../config/db.js', () => ({
  default: mockPrisma,
}));

jest.unstable_mockModule('../../socket/index.js', () => ({
  getIO: () => mockIO,
  initSocket: jest.fn(),
}));

const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = await import('../../services/notification.service.js');

describe('Notification Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('creates a notification and emits to user room', async () => {
      const data = { type: 'MENTION', content: 'test', userId: 'user1', linkUrl: '/test' };
      const created = { id: 'notif1', ...data, isRead: false, createdAt: new Date() };
      
      mockPrisma.notification.create.mockResolvedValue(created);

      const result = await createNotification(data);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({ data });
      expect(mockIO.to).toHaveBeenCalledWith('user:user1');
      expect(mockIO.emit).toHaveBeenCalledWith('notification:new', created);
      expect(result).toEqual(created);
    });
  });

  describe('getUserNotifications', () => {
    it('returns notifications and unread count', async () => {
      const notifications = [{ id: '1', content: 'test' }];
      mockPrisma.notification.findMany.mockResolvedValue(notifications);
      mockPrisma.notification.count.mockResolvedValue(1);

      const result = await getUserNotifications('user1');

      expect(result.notifications).toEqual(notifications);
      expect(result.unreadCount).toBe(1);
    });
  });

  describe('markAsRead', () => {
    it('updates isRead to true', async () => {
      const notification = { id: '1', userId: 'user1', isRead: false };
      mockPrisma.notification.findUnique.mockResolvedValue(notification);
      mockPrisma.notification.update.mockResolvedValue({ ...notification, isRead: true });

      const result = await markAsRead('1', 'user1');

      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isRead: true }
      });
      expect(result.isRead).toBe(true);
    });

    it('throws Forbidden if userId mismatch', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: '1', userId: 'other' });
      await expect(markAsRead('1', 'user1')).rejects.toThrow('Not authorized');
    });
  });

  describe('markAllAsRead', () => {
    it('updates all unread notifications for user', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

      await markAllAsRead('user1');

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user1', isRead: false },
        data: { isRead: true }
      });
    });
  });
});
