import express from 'express';
import * as goalController from '../controllers/goal.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { requireWorkspaceMember, requireRole } from '../middleware/rbac.js';
import {
  createGoalSchema, updateGoalSchema,
  createMilestoneSchema, updateMilestoneSchema,
  createActivitySchema,
} from '../utils/validators/goal.validators.js';

const router = express.Router({ mergeParams: true });

router.use(requireAuth, requireWorkspaceMember);

router.post('/', validate(createGoalSchema), goalController.create);
router.get('/', goalController.list);
router.get('/:goalId', goalController.getById);
router.put('/:goalId', validate(updateGoalSchema), goalController.update);
router.delete('/:goalId', requireRole('ADMIN'), goalController.remove);

router.post('/:goalId/milestones', validate(createMilestoneSchema), goalController.createMilestone);
router.put('/:goalId/milestones/:milestoneId', validate(updateMilestoneSchema), goalController.updateMilestone);
router.delete('/:goalId/milestones/:milestoneId', requireRole('ADMIN'), goalController.deleteMilestone);

router.post('/:goalId/activities', validate(createActivitySchema), goalController.createActivity);

export default router;