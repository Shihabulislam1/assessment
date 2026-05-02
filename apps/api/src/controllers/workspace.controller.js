import * as workspaceService from '../services/workspace.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.user.id, req.body);
  res.status(201).json({ workspace });
});

export const list = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.listUserWorkspaces(req.user.id);
  res.json({ workspaces });
});

export const getById = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.workspaceId);
  res.json({ workspace });
});

export const update = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, req.user.id, req.body);
  res.json({ workspace });
});

export const remove = asyncHandler(async (req, res) => {
  await workspaceService.deleteWorkspace(req.params.workspaceId, req.user.id);
  res.status(204).send();
});

export const invite = asyncHandler(async (req, res) => {
  const membership = await workspaceService.inviteMember(req.params.workspaceId, req.user.id, req.body);
  res.status(201).json({ membership });
});

export const updateRole = asyncHandler(async (req, res) => {
  const membership = await workspaceService.updateMemberRole(req.params.workspaceId, req.params.memberId, req.user.id, req.body);
  res.json({ membership });
});

export const removeMember = asyncHandler(async (req, res) => {
  await workspaceService.removeMember(req.params.workspaceId, req.params.memberId, req.user.id);
  res.status(204).send();
});