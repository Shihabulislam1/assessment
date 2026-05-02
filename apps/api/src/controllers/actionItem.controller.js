import * as actionItemService from '../services/actionItem.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const create = asyncHandler(async (req, res) => {
  const item = await actionItemService.createActionItem(req.params.workspaceId, req.user.id, req.body);
  res.status(201).json({ item });
});

export const list = asyncHandler(async (req, res) => {
  const items = await actionItemService.listActionItems(req.params.workspaceId, req.query);
  res.json({ items });
});

export const getById = asyncHandler(async (req, res) => {
  const item = await actionItemService.getActionItemById(req.params.workspaceId, req.params.itemId);
  res.json({ item });
});

export const update = asyncHandler(async (req, res) => {
  const item = await actionItemService.updateActionItem(req.params.workspaceId, req.params.itemId, req.user.id, req.body);
  res.json({ item });
});

export const remove = asyncHandler(async (req, res) => {
  await actionItemService.deleteActionItem(req.params.workspaceId, req.params.itemId, req.user.id);
  res.status(204).send();
});