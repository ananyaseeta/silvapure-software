import { z } from 'zod';
import { UserStatus, RoleCode } from '@prisma/client';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#^])/,
    'Password must contain uppercase, lowercase, number, and special character',
  );

export const createUserSchema = z.object({
  organizationId: z.string().uuid('Organization ID must be a valid UUID'),
  firstName:      z.string().min(1, 'First name is required').max(100).trim(),
  lastName:       z.string().max(100).trim().optional(),
  email:          z.string().min(1, 'Email is required').email('Invalid email address').toLowerCase().trim(),
  password:       passwordSchema,
  phone:          z.string().max(30).trim().optional(),
  jobTitle:       z.string().max(100).trim().optional(),
  roles:          z.array(z.nativeEnum(RoleCode)).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    firstName: z.string().min(1).max(100).trim().optional(),
    lastName:  z.string().max(100).trim().nullable().optional(),
    phone:     z.string().max(30).trim().nullable().optional(),
    jobTitle:  z.string().max(100).trim().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided for update' });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export const assignRolesSchema = z.object({
  roles: z.array(z.nativeEnum(RoleCode)).min(1, 'At least one role must be specified'),
});

export type AssignRolesInput = z.infer<typeof assignRolesSchema>;

export const listUsersQuerySchema = z.object({
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(20),
  organizationId: z.string().uuid().optional(),
  status:         z.nativeEnum(UserStatus).optional(),
  search:         z.string().trim().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userIdParamSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID'),
});
