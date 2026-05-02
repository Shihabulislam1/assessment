import { Forbidden, NotFound } from '../utils/AppError.js';
import prisma from '../config/db.js';

export const requireWorkspaceMember = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId;
    if (!workspaceId) throw new NotFound('Workspace not found');

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId: req.user.id, workspaceId },
      },
    });

    if (!membership) throw new Forbidden('You are not a member of this workspace');

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.membership) throw new Forbidden('Workspace membership not established');
      if (!roles.includes(req.membership.role)) {
        throw new Forbidden(`Requires one of the following roles: ${roles.join(', ')}`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};