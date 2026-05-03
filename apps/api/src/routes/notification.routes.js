import express from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', notificationController.list);
router.put('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;
