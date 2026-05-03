import prisma from '../config/db.js';
import { createAuditLog } from './audit.service.js';
import { NotFound, Conflict, Forbidden } from '../utils/AppError.js';

const ensureAdmin = async (userId, workspaceId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!member || member.role !== 'ADMIN') {
    throw new Forbidden('You do not have administrative privileges in this workspace');
  }
};

export const createWorkspace = async (userId, data) => {
  const workspace = await prisma.workspace.create({
    data: {
      name: data.name,
      description: data.description,
      accentColor: data.accentColor || '#6366f1',
      members: { create: { userId, role: 'ADMIN' } },
    },
    include: { members: { include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } } } },
  });

  await createAuditLog({
    action: 'CREATE', entity: 'Workspace', entityId: workspace.id,
    changes: { name: data.name }, userId, workspaceId: workspace.id,
  });

  return workspace;
};

export const listUserWorkspaces = async (userId) => {
  return prisma.workspace.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { goals: true, announcements: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getWorkspaceById = async (workspaceId) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      _count: { select: { goals: true, announcements: true, actionItems: true } },
    },
  });
  if (!workspace) throw new NotFound('Workspace not found');
  return workspace;
};

export const updateWorkspace = async (workspaceId, userId, data) => {
  await ensureAdmin(userId, workspaceId);

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: data.name,
      description: data.description,
      accentColor: data.accentColor,
      imageUrl: data.imageUrl,
    },
  });

  await createAuditLog({
    action: 'UPDATE', entity: 'Workspace', entityId: workspaceId,
    changes: data, userId, workspaceId,
  });

  return workspace;
};

export const deleteWorkspace = async (workspaceId, userId) => {
  await ensureAdmin(userId, workspaceId);

  await prisma.workspace.delete({ where: { id: workspaceId } });

  await createAuditLog({
    action: 'DELETE', entity: 'Workspace', entityId: workspaceId,
    changes: {}, userId, workspaceId,
  });
};

export const inviteMember = async (workspaceId, inviterId, data) => {
  await ensureAdmin(inviterId, workspaceId);

  const invitee = await prisma.user.findUnique({ where: { email: data.email } });
  if (!invitee) throw new NotFound('User not found with that email');

  try {
    const membership = await prisma.$transaction(async (tx) => {
      const m = await tx.workspaceMember.create({
        data: { userId: invitee.id, workspaceId, role: data.role || 'MEMBER' },
        include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
      });

      await tx.notification.create({
        data: {
          type: 'WORKSPACE_INVITE',
          content: 'You have been invited to a workspace',
          userId: invitee.id,
          linkUrl: `/workspace/${workspaceId}`,
        },
      });

      return m;
    });

    await createAuditLog({
      action: 'ADD_MEMBER', entity: 'WorkspaceMember', entityId: membership.id,
      changes: { email: data.email, role: data.role }, userId: inviterId, workspaceId,
    });

    return membership;
  } catch (err) {
    if (err.code === 'P2002') {
      throw new Conflict('User is already a member of this workspace');
    }
    throw err;
  }
};

export const updateMemberRole = async (workspaceId, memberId, adminId, data) => {
  await ensureAdmin(adminId, workspaceId);

  const membership = await prisma.workspaceMember.update({
    where: { id: memberId, workspaceId },
    data: { role: data.role },
    include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } },
  });

  await createAuditLog({
    action: 'UPDATE_ROLE', entity: 'WorkspaceMember', entityId: memberId,
    changes: { role: data.role }, userId: adminId, workspaceId,
  });

  return membership;
};

export const removeMember = async (workspaceId, memberId, adminId) => {
  await ensureAdmin(adminId, workspaceId);

  await prisma.workspaceMember.delete({ where: { id: memberId, workspaceId } });

  await createAuditLog({
    action: 'REMOVE_MEMBER', entity: 'WorkspaceMember', entityId: memberId,
    changes: {}, userId: adminId, workspaceId,
  });
};