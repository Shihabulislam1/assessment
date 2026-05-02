import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/).optional(),
}).strict();

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/).optional(),
}).strict();

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
}).strict();

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
}).strict();