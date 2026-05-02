import { z } from 'zod';

export const createAnnouncementSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  content: z.string().min(1).max(10000),
  isPinned: z.boolean().default(false),
}).strict();

export const updateAnnouncementSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  isPinned: z.boolean().optional(),
}).strict();

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
}).strict();

export const toggleReactionSchema = z.object({
  emoji: z.string().min(1).max(8),
}).strict();