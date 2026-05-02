import { z } from 'zod';

const iso_datetime = z.string().datetime();
const datetimeLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

export const createActionItemSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.union([iso_datetime, datetimeLocal, z.literal('')]).optional().nullable().transform((v) => {
    if (v === '' || v === null || v === undefined) return null;
    return v;
  }),
  assigneeId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
}).strict();

export const updateActionItemSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.union([iso_datetime, datetimeLocal, z.literal('')]).optional().nullable().transform((v) => {
    if (v === '' || v === null || v === undefined) return null;
    return v;
  }),
  assigneeId: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
}).strict();