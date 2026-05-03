import * as announcementService from '../services/announcement.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getIO } from '../socket/index.js';

export const create = asyncHandler(async (req, res) => {
  const announcement = await announcementService.createAnnouncement(req.params.workspaceId, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('announcement:created', announcement);
  res.status(201).json({ announcement });
});

export const list = asyncHandler(async (req, res) => {
  const announcements = await announcementService.listAnnouncements(req.params.workspaceId);
  res.json({ announcements });
});

export const getById = asyncHandler(async (req, res) => {
  const announcement = await announcementService.getAnnouncementById(req.params.workspaceId, req.params.id);
  res.json({ announcement });
});

export const update = asyncHandler(async (req, res) => {
  const announcement = await announcementService.updateAnnouncement(req.params.workspaceId, req.params.id, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('announcement:updated', announcement);
  res.json({ announcement });
});

export const remove = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.workspaceId, req.params.id, req.user.id);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('announcement:deleted', req.params.id);
  res.status(204).send();
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await announcementService.createComment(req.params.workspaceId, req.params.id, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('comment:created', { announcementId: req.params.id, comment });
  res.status(201).json({ comment });
});

export const toggleReaction = asyncHandler(async (req, res) => {
  const result = await announcementService.toggleReaction(req.params.workspaceId, req.params.id, req.user.id, req.body);
  getIO().to(`workspace:${req.params.workspaceId}`).emit('reaction:toggled', { announcementId: req.params.id, ...result });
  res.json(result);
});