import express from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspaceMember } from '../middleware/rbac.js';

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.get('/summary', analyticsController.getSummary);
router.get('/charts', analyticsController.getChartData);
router.get('/export', analyticsController.exportCsv);

export default router;
