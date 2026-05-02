import prisma from '../config/db.js';
import { createAuditLog } from './audit.service.js';
import { NotFound } from '../utils/AppError.js';

export const createGoal = async (workspaceId, userId, data) => {
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
  const activity = await prisma.activity.create({
    data: { content: data.content, goalId, userId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Activity', entityId: activity.id,
    changes: { content: data.content.substring(0, 100) }, userId, workspaceId,
  });

  return activity;
};