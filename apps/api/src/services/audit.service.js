import prisma from '../config/db.js';

export async function createAuditLog({ action, entity, entityId, changes, userId, workspaceId }) {
  return prisma.auditLog.create({
    data: { action, entity, entityId, changes, userId, workspaceId },
  });
}

export async function listAuditLogs(workspaceId, query) {
  const { page = 1, limit = 20, entity, action } = query;
  const skip = (page - 1) * limit;

  const where = { workspaceId };
  if (entity) where.entity = entity;
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { 
        user: { 
          select: { id: true, name: true, email: true } 
        } 
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit),
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
  };
}

export async function exportAuditLogsCsv(workspaceId, query) {
  const { entity, action } = query;
  const where = { workspaceId };
  if (entity) where.entity = entity;
  if (action) where.action = action;

  const logs = await prisma.auditLog.findMany({
    where,
    include: { 
      user: { 
        select: { name: true } 
      } 
    },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'Action,Entity,EntityId,User,Date,Changes\n';
  const rows = logs.map(log => {
    const changes = log.changes ? JSON.stringify(log.changes).replace(/"/g, '""') : '';
    return `${log.action},${log.entity},${log.entityId},${log.user?.name || 'Unknown'},${log.createdAt.toISOString()},"${changes}"`;
  }).join('\n');

  return header + rows;
}