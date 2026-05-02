import express from 'express';
import * as auditController from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspaceMember } from '../middleware/rbac.js';

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.get('/', auditController.list);
router.get('/export', auditController.exportCsv);

export default router;