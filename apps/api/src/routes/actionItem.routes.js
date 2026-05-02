import express from 'express';
import * as actionItemController from '../controllers/actionItem.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspaceMember, requireRole } from '../middleware/rbac.js';
import { createActionItemSchema, updateActionItemSchema } from '../utils/validators/actionItem.validators.js';

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.post('/', validate(createActionItemSchema), actionItemController.create);
router.get('/', actionItemController.list);
router.get('/:itemId', actionItemController.getById);
router.put('/:itemId', validate(updateActionItemSchema), actionItemController.update);
router.delete('/:itemId', requireRole('ADMIN'), actionItemController.remove);

export default router;