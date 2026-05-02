import sanitizeHtml from 'sanitize-html';
import prisma from '../config/db.js';
import { createAuditLog } from './audit.service.js';
import { NotFound } from '../utils/AppError.js';

const sanitize = (html) => sanitizeHtml(html, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt'] },
});

export const createAnnouncement = async (workspaceId, userId, data) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: data.title,
      content: sanitize(data.content),
      isPinned: data.isPinned || false,
      authorId: userId,
      workspaceId,
    },
    include: { author: { select: { id: true, email: true, name: true, avatarUrl: true } } },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Announcement', entityId: announcement.id,
    changes: { title: data.title }, userId, workspaceId,
  });

  return announcement;
};

export const listAnnouncements = async (workspaceId) => {
  return prisma.announcement.findMany({
    where: { workspaceId },
    include: {
      author: { select: { id: true, email: true, name: true, avatarUrl: true } },
      _count: { select: { comments: true, reactions: true } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });
};

export const getAnnouncementById = async (workspaceId, id) => {
  const announcement = await prisma.announcement.findFirst({
    where: { id, workspaceId },
    include: {
      author: { select: { id: true, email: true, name: true, avatarUrl: true } },
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      },
      reactions: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!announcement) throw new NotFound('Announcement not found');
  return announcement;
};

export const updateAnnouncement = async (workspaceId, id, userId, data) => {
  const announcement = await prisma.announcement.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content ? sanitize(data.content) : undefined,
      isPinned: data.isPinned,
    },
    include: { author: { select: { id: true, email: true, name: true, avatarUrl: true } } },
  });

  await createAuditLog({
    action: 'UPDATE', entity: 'Announcement', entityId: id,
    changes: data, userId, workspaceId,
  });

  return announcement;
};

export const deleteAnnouncement = async (workspaceId, id, userId) => {
  await prisma.announcement.delete({ where: { id } });

  await createAuditLog({
    action: 'DELETE', entity: 'Announcement', entityId: id,
    changes: {}, userId, workspaceId,
  });
};

export const createComment = async (workspaceId, announcementId, userId, data) => {
  const announcement = await prisma.announcement.findFirst({ where: { id: announcementId, workspaceId } });
  if (!announcement) throw new NotFound('Announcement not found');

  const comment = await prisma.comment.create({
    data: { content: data.content, authorId: userId, announcementId },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Comment', entityId: comment.id,
    changes: { announcementId }, userId, workspaceId,
  });

  return comment;
};

export const toggleReaction = async (workspaceId, announcementId, userId, data) => {
  const announcement = await prisma.announcement.findFirst({ where: { id: announcementId, workspaceId } });
  if (!announcement) throw new NotFound('Announcement not found');

  const existing = await prisma.reaction.findUnique({
    where: { userId_announcementId_emoji: { userId, announcementId, emoji: data.emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    await createAuditLog({ action: 'DELETE', entity: 'Reaction', entityId: existing.id, changes: { emoji: data.emoji }, userId, workspaceId });
    return { emoji: data.emoji, removed: true };
  }

  const reaction = await prisma.reaction.create({
    data: { userId, announcementId, emoji: data.emoji },
    include: { user: { select: { id: true, name: true } } },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Reaction', entityId: reaction.id,
    changes: { emoji: data.emoji }, userId, workspaceId,
  });

  return reaction;
};