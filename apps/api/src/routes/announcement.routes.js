import express from 'express';
import * as announcementController from '../controllers/announcement.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspaceMember, requireRole } from '../middleware/rbac.js';
import {
  createAnnouncementSchema, updateAnnouncementSchema,
  createCommentSchema, toggleReactionSchema,
} from '../utils/validators/announcement.validators.js';

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.post('/', requireRole('ADMIN'), validate(createAnnouncementSchema), announcementController.create);
router.get('/', announcementController.list);
router.get('/:id', announcementController.getById);
router.put('/:id', requireRole('ADMIN'), validate(updateAnnouncementSchema), announcementController.update);
router.delete('/:id', requireRole('ADMIN'), announcementController.remove);

router.post('/:id/comments', validate(createCommentSchema), announcementController.createComment);
router.post('/:id/reactions', validate(toggleReactionSchema), announcementController.toggleReaction);

export default router;