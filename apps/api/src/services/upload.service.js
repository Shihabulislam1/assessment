import cloudinary from '../config/cloudinary.js';
import prisma from '../config/db.js';
import { Forbidden, NotFound } from '../utils/AppError.js';

export const uploadToCloudinary = (buffer, folder, transformations = []) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: transformations,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const uploadUserAvatar = async (userId, buffer) => {
  const result = await uploadToCloudinary(buffer, 'avatars', [
    { width: 200, height: 200, crop: 'thumb', gravity: 'face' }
  ]);
  
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: result.secure_url },
  });
  
  return result.secure_url;
};

export const uploadWorkspaceImage = async (workspaceId, userId, buffer) => {
  // Check if user is admin of the workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: { userId, workspaceId }
    }
  });

  if (!membership) throw new NotFound('Workspace membership not found');
  if (membership.role !== 'ADMIN') throw new Forbidden('Only admins can update workspace image');

  const result = await uploadToCloudinary(buffer, 'workspaces', [
    { width: 400, height: 400, crop: 'fill' }
  ]);

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { imageUrl: result.secure_url },
  });

  return result.secure_url;
};
