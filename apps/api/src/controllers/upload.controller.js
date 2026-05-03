import * as uploadService from '../services/upload.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { Validation } from '../utils/AppError.js';

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new Validation('No image provided');
  const avatarUrl = await uploadService.uploadUserAvatar(req.user.id, req.file.buffer);
  res.json({ avatarUrl });
});

export const uploadWorkspaceImage = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  if (!req.file) throw new Validation('No image provided');
  const imageUrl = await uploadService.uploadWorkspaceImage(workspaceId, req.user.id, req.file.buffer);
  res.json({ imageUrl });
});
