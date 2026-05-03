import sanitizeHtml from 'sanitize-html';
import prisma from '../config/db.js';
import { createAuditLog } from './audit.service.js';
import { NotFound, Forbidden } from '../utils/AppError.js';
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

const ensureAdmin = async (userId, workspaceId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member || member.role !== 'ADMIN') {
    throw new Forbidden('Only administrators can modify goals in this workspace');
  }
};

export const createGoal = async (workspaceId, userId, data) => {
  await ensureAdmin(userId, workspaceId);
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.dueDate && isNaN(dueDate.getTime())) {
    throw new Error('Invalid dueDate format');
  }
  const goal = await prisma.goal.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate,
      ownerId: userId,
      workspaceId,
    },
    include: {
      owner: { select: { id: true, email: true, name: true, avatarUrl: true } },
      _count: { select: { milestones: true, actionItems: true } },
    },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Goal', entityId: goal.id,
    changes: { title: data.title }, userId, workspaceId,
  });

  return goal;
};

export const listGoals = async (workspaceId) => {
  return prisma.goal.findMany({
    where: { workspaceId },
    include: {
      owner: { select: { id: true, email: true, name: true, avatarUrl: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
      _count: { select: { milestones: true, actionItems: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getGoalById = async (workspaceId, goalId) => {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, workspaceId },
    include: {
      owner: { select: { id: true, email: true, name: true, avatarUrl: true } },
      milestones: { orderBy: { createdAt: 'asc' } },
      actionItems: {
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!goal) throw new NotFound('Goal not found');
  return goal;
};

export const updateGoal = async (workspaceId, goalId, userId, data) => {
  await ensureAdmin(userId, workspaceId);
  const dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.dueDate && isNaN(dueDate.getTime())) {
    throw new Error('Invalid dueDate format');
  }
  const goal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      dueDate,
    },
    include: {
      owner: { select: { id: true, email: true, name: true, avatarUrl: true } },
      milestones: true,
      _count: { select: { milestones: true, actionItems: true } },
    },
  });

  await createAuditLog({
    action: 'UPDATE', entity: 'Goal', entityId: goalId,
    changes: data, userId, workspaceId,
  });

  return goal;
};

export const deleteGoal = async (workspaceId, goalId, userId) => {
  await ensureAdmin(userId, workspaceId);
  await prisma.goal.delete({ where: { id: goalId } });

  await createAuditLog({
    action: 'DELETE', entity: 'Goal', entityId: goalId,
    changes: {}, userId, workspaceId,
  });
};

export const createMilestone = async (workspaceId, goalId, userId, data) => {
  const milestone = await prisma.milestone.create({
    data: { title: data.title, goalId },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Milestone', entityId: milestone.id,
    changes: { title: data.title, goalId }, userId, workspaceId,
  });

  return milestone;
};

export const updateMilestone = async (workspaceId, milestoneId, userId, data) => {
  const milestone = await prisma.milestone.update({
    where: { id: milestoneId },
    data: { title: data.title, progress: data.progress },
  });

  await createAuditLog({
    action: 'UPDATE', entity: 'Milestone', entityId: milestoneId,
    changes: data, userId, workspaceId,
  });

  return milestone;
};

export const deleteMilestone = async (workspaceId, milestoneId, userId) => {
  await prisma.milestone.delete({ where: { id: milestoneId } });

  await createAuditLog({
    action: 'DELETE', entity: 'Milestone', entityId: milestoneId,
    changes: {}, userId, workspaceId,
  });
};

export const createActivity = async (workspaceId, goalId, userId, data) => {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  const activity = await prisma.activity.create({
    data: { content: sanitize(data.content), goalId, userId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Activity', entityId: activity.id,
    changes: { content: data.content.substring(0, 100) }, userId, workspaceId,
  });

  // Handle mentions
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
        content: `${activity.user.name} mentioned you in a goal activity for: ${goal.title}`,
        userId: targetUser.id,
        linkUrl: `/workspace/${workspaceId}/goals/${goalId}`
      });
    }
  }

  return activity;
};