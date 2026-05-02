import express from 'express';
import * as workspaceController from '../controllers/workspace.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspaceMember, requireRole } from '../middleware/rbac.js';
import {
  createWorkspaceSchema, updateWorkspaceSchema,
  inviteMemberSchema, updateMemberRoleSchema,
} from '../utils/validators/workspace.validators.js';

import { inviteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', validate(createWorkspaceSchema), workspaceController.create);
router.get('/', workspaceController.list);

router.get('/:workspaceId', requireWorkspaceMember, workspaceController.getById);
router.put('/:workspaceId', requireWorkspaceMember, requireRole('ADMIN'), validate(updateWorkspaceSchema), workspaceController.update);
router.delete('/:workspaceId', requireWorkspaceMember, requireRole('ADMIN'), workspaceController.remove);

router.post('/:workspaceId/invite', inviteLimiter, requireWorkspaceMember, requireRole('ADMIN'), validate(inviteMemberSchema), workspaceController.invite);
router.put('/:workspaceId/members/:memberId/role', requireWorkspaceMember, requireRole('ADMIN'), validate(updateMemberRoleSchema), workspaceController.updateRole);
router.delete('/:workspaceId/members/:memberId', requireWorkspaceMember, requireRole('ADMIN'), workspaceController.removeMember);

export default router;