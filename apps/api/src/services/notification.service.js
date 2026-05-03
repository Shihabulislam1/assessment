import prisma from '../config/db.js';
import { getIO } from '../socket/index.js';
import { NotFound, Forbidden } from '../utils/AppError.js';

export const createNotification = async ({ type, content, userId, linkUrl }) => {
  const notification = await prisma.notification.create({
    data: { type, content, userId, linkUrl },
  });

  try {
    getIO().to(`user:${userId}`).emit('notification:new', notification);
  } catch (err) {
    console.error('Failed to emit notification via socket:', err);
  }

  return notification;
};

export const getUserNotifications = async (userId) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return { notifications, unreadCount };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) throw new NotFound('Notification not found');
  if (notification.userId !== userId) throw new Forbidden('Not authorized');

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
