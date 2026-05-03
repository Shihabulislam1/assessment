import express from 'express';
import * as auditController from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspaceMember, requireRole } from '../middleware/rbac.js';

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.get('/', requireRole('ADMIN'), auditController.list);
router.get('/export', requireRole('ADMIN'), auditController.exportCsv);

export default router;