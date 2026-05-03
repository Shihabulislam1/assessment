import sanitizeHtml from 'sanitize-html';
import prisma from '../config/db.js';
import { createAuditLog } from './audit.service.js';
import { NotFound } from '../utils/AppError.js';
import { extractMentions } from '../utils/mentions.js';
import * as notificationService from './notification.service.js';

const sanitize = (html) => sanitizeHtml(html, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'span']),
  allowedAttributes: { 
    ...sanitizeHtml.defaults.allowedAttributes, 
    img: ['src', 'alt'],
    span: ['class', 'data-id', 'data-value', 'data-denotation-char', 'data-index']
  },
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

  // Handle mentions
  const mentionedNames = extractMentions(data.content);
  if (mentionedNames.length > 0) {
    const usersToNotify = await prisma.user.findMany({
      where: { 
        name: { in: mentionedNames, mode: 'insensitive' },
        memberships: { some: { workspaceId } } // Ensure they are in the workspace
      },
      select: { id: true }
    });
    
    for (const targetUser of usersToNotify) {
      if (targetUser.id === userId) continue;
      await notificationService.createNotification({
        type: 'MENTION',
        content: `${announcement.author.name} mentioned you in an announcement: ${announcement.title}`,
        userId: targetUser.id,
        linkUrl: `/workspace/${workspaceId}/announcements`
      });
    }
  }

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
    data: { content: sanitize(data.content), authorId: userId, announcementId },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Comment', entityId: comment.id,
    changes: { announcementId }, userId, workspaceId,
  });

  // Handle mentions in comments
  const mentionedNames = extractMentions(data.content);
  if (mentionedNames.length > 0) {
    const usersToNotify = await prisma.user.findMany({
      where: { 
        name: { in: mentionedNames, mode: 'insensitive' },
        memberships: { some: { workspaceId } }
      },
      select: { id: true }
    });
    
    for (const targetUser of usersToNotify) {
      if (targetUser.id === userId) continue;
      await notificationService.createNotification({
        type: 'MENTION',
        content: `${comment.author.name} mentioned you in a comment on: ${announcement.title}`,
        userId: targetUser.id,
        linkUrl: `/workspace/${workspaceId}/announcements`
      });
    }
  }

  return comment;
};

export const toggleReaction = async (workspaceId, announcementId, userId, data) => {
  const announcement = await prisma.announcement.findFirst({ where: { id: announcementId, workspaceId } });
  if (!announcement) throw new NotFound('Announcement not found');

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.reaction.findUnique({
      where: { userId_announcementId_emoji: { userId, announcementId, emoji: data.emoji } },
    });

    if (existing) {
      await tx.reaction.delete({ where: { id: existing.id } });
      return { emoji: data.emoji, removed: true, id: existing.id };
    }

    const reaction = await tx.reaction.create({
      data: { userId, announcementId, emoji: data.emoji },
      include: { user: { select: { id: true, name: true } } },
    });

    return reaction;
  });

  await createAuditLog({
    action: result.removed ? 'DELETE' : 'CREATE',
    entity: 'Reaction',
    entityId: result.id,
    changes: { emoji: data.emoji },
    userId,
    workspaceId,
  });

  return result;
};