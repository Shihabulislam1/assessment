import prisma from '../config/db.js';

export async function createAuditLog({ action, entity, entityId, changes, userId, workspaceId }) {
  return prisma.auditLog.create({
    data: { action, entity, entityId, changes, userId, workspaceId },
  });
}