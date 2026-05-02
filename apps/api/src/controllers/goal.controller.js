import * as goalService from '../services/goal.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const goal = await goalService.createGoal(req.params.workspaceId, req.user.id, req.body);
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
  res.json({ goal });
});

export const remove = asyncHandler(async (req, res) => {
  await goalService.deleteGoal(req.params.workspaceId, req.params.goalId, req.user.id);
  res.status(204).send();
});

export const createMilestone = asyncHandler(async (req, res) => {
  const milestone = await goalService.createMilestone(req.params.workspaceId, req.params.goalId, req.user.id, req.body);
  res.status(201).json({ milestone });
});

export const updateMilestone = asyncHandler(async (req, res) => {
  const milestone = await goalService.updateMilestone(req.params.workspaceId, req.params.milestoneId, req.user.id, req.body);
  res.json({ milestone });
});

export const deleteMilestone = asyncHandler(async (req, res) => {
  await goalService.deleteMilestone(req.params.workspaceId, req.params.milestoneId, req.user.id);
  res.status(204).send();
});

export const createActivity = asyncHandler(async (req, res) => {
  const activity = await goalService.createActivity(req.params.workspaceId, req.params.goalId, req.user.id, req.body);
  res.status(201).json({ activity });
});