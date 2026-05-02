import prisma from '../config/db.js';
import { createAuditLog } from './audit.service.js';
import { NotFound } from '../utils/AppError.js';

export const createActionItem = async (workspaceId, userId, data) => {
  const item = await prisma.actionItem.create({
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: data.assigneeId,
      goalId: data.goalId,
      workspaceId,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'ActionItem', entityId: item.id,
    changes: { title: data.title }, userId, workspaceId,
  });

  return item;
};

export const listActionItems = async (workspaceId, filters = {}) => {
  const { status, assigneeId, priority, goalId, sort = 'createdAt' } = filters;

  const where = { workspaceId };
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;
  if (priority) where.priority = priority;
  if (goalId) where.goalId = goalId;

  const sortMap = { createdAt: { createdAt: 'desc' }, priority: { priority: 'desc' }, dueDate: { dueDate: 'asc' } };

  return prisma.actionItem.findMany({
    where,
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
    orderBy: sortMap[sort] || { createdAt: 'desc' },
  });
};

export const getActionItemById = async (workspaceId, itemId) => {
  const item = await prisma.actionItem.findFirst({
    where: { id: itemId, workspaceId },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
  });
  if (!item) throw new NotFound('Action item not found');
  return item;
};

export const updateActionItem = async (workspaceId, itemId, userId, data) => {
  const item = await prisma.actionItem.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: data.assigneeId,
      goalId: data.goalId,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      goal: { select: { id: true, title: true } },
    },
  });

  await createAuditLog({
    action: 'UPDATE', entity: 'ActionItem', entityId: itemId,
    changes: data, userId, workspaceId,
  });

  return item;
};

export const deleteActionItem = async (workspaceId, itemId, userId) => {
  await prisma.actionItem.delete({ where: { id: itemId } });

  await createAuditLog({
    action: 'DELETE', entity: 'ActionItem', entityId: itemId,
    changes: {}, userId, workspaceId,
  });
};