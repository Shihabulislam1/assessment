import prisma from '../config/db.js';
import { getIO } from '../socket/index.js';
import { NotFound, Forbidden } from '../utils/AppError.js';

export const createNotification = async ({ type, content, userId, workspaceId, linkUrl }) => {
  const notification = await prisma.notification.create({
    data: { type, content, userId, workspaceId, linkUrl },
  });

  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', notification);
  } catch (err) {
    // Only log if it's not a "not initialized" error, or handle specifically
    if (err.message === 'Socket.io not initialized') {
      console.warn(`Socket.io not initialized. Notification for user ${userId} stored in DB but not emitted.`);
    } else {
      console.error(`CRITICAL: Failed to emit notification via socket to user ${userId}:`, err);
    }
  }

  return notification;
};

export const getUserNotifications = async (userId) => {
  // Get user's current workspaces
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    select: { workspaceId: true }
  });
  const activeWorkspaceIds = memberships.map(m => m.workspaceId);

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { 
        userId,
        OR: [
          { workspaceId: null },
          { workspaceId: { in: activeWorkspaceIds } }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({
      where: { 
        userId, 
        isRead: false,
        OR: [
          { workspaceId: null },
          { workspaceId: { in: activeWorkspaceIds } }
        ]
      },
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
