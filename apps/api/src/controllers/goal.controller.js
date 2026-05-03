import * as goalService from '../services/goal.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getIO } from '../socket/index.js';

export const create = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal(req.params.workspaceId, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('goal:created', goal);
  res.status(201).json({ goal });
});

export const list = asyncHandler(async (req, res) => {
  const goals = await goalService.listGoals(req.params.workspaceId);
  res.json({ goals });
});

export const getById = asyncHandler(async (req, res) => {
  const goal = await goalService.getGoalById(req.params.workspaceId, req.params.goalId);
  res.json({ goal });
});

export const update = asyncHandler(async (req, res) => {
  const goal = await goalService.updateGoal(req.params.workspaceId, req.params.goalId, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('goal:updated', goal);
  res.json({ goal });
});

export const remove = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.params.workspaceId, req.params.goalId, req.user.id);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('goal:deleted', req.params.goalId);
  res.status(204).send();
});

export const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await goalService.createMilestone(req.params.workspaceId, req.params.goalId, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('milestone:created', { goalId: req.params.goalId, milestone });
  res.status(201).json({ milestone });
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await goalService.updateMilestone(req.params.workspaceId, req.params.milestoneId, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('milestone:updated', { milestoneId: req.params.milestoneId, milestone });
  res.json({ milestone });
});

export const deleteMilestone = asyncHandler(async (req, res) => {
  await goalService.deleteMilestone(req.params.workspaceId, req.params.milestoneId, req.user.id);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('milestone:deleted', { milestoneId: req.params.milestoneId });
  res.status(204).send();
});

export const createActivity = asyncHandler(async (req, res) => {
  const activity = await goalService.createActivity(req.params.workspaceId, req.params.goalId, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('activity:created', { goalId: req.params.goalId, activity });
  res.status(201).json({ activity });
});