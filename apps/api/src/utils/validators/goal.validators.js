import { z } from 'zod';

const iso_datetime = z.string().datetime();
const datetimeLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

export const createGoalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.union([iso_datetime, datetimeLocal, z.literal('')]).optional().transform((v) => {
    if (v === '' || v === null || v === undefined) return null;
    return v;
  }),
}).strict();

export const updateGoalSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  dueDate: z.union([iso_datetime, datetimeLocal, z.literal('')]).optional().transform((v) => {
    if (v === '' || v === null || v === undefined) return null;
    return v;
  }),
}).strict();

export const createMilestoneSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
}).strict();

export const updateMilestoneSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  progress: z.number().int().min(0).max(100).optional(),
}).strict();

export const createActivitySchema = z.object({
  content: z.string().min(1).max(1000),
}).strict();