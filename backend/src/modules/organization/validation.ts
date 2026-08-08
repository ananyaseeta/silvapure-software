/**
 * Organization Validation
 *
 * Zod v4 schemas for all organization request bodies.
 * Zod v4 uses { error } instead of { required_error / invalid_type_error }.
 */

import { z } from 'zod';
import { OrganizationStatus } from '@prisma/client';

// ─── Create ───────────────────────────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  organizationCode: z
    .string()
    .min(2,  'Organization code must be at least 2 characters')
    .max(20, 'Organization code must not exceed 20 characters')
    .regex(
      /^[A-Z0-9_-]+$/,
      'Organization code must contain only uppercase letters, numbers, hyphens, and underscores',
    ),
  legalName: z
    .string()
    .min(2,   'Legal name must be at least 2 characters')
    .max(200, 'Legal name must not exceed 200 characters')
    .trim(),
  displayName: z
    .string()
    .min(2,   'Display name must be at least 2 characters')
    .max(100, 'Display name must not exceed 100 characters')
    .trim(),
  industryTypeId: z
    .string()
    .uuid('Industry type ID must be a valid UUID'),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  phone: z
    .string()
    .max(30, 'Phone must not exceed 30 characters')
    .trim()
    .optional(),
  website: z
    .string()
    .url('Website must be a valid URL')
    .trim()
    .optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateOrganizationSchema = z
  .object({
    legalName: z
      .string()
      .min(2,   'Legal name must be at least 2 characters')
      .max(200, 'Legal name must not exceed 200 characters')
      .trim()
      .optional(),
    displayName: z
      .string()
      .min(2,   'Display name must be at least 2 characters')
      .max(100, 'Display name must not exceed 100 characters')
      .trim()
      .optional(),
    email: z
      .string()
      .email('Invalid email address')
      .toLowerCase()
      .trim()
      .nullable()
      .optional(),
    phone: z
      .string()
      .max(30, 'Phone must not exceed 30 characters')
      .trim()
      .nullable()
      .optional(),
    website: z
      .string()
      .url('Website must be a valid URL')
      .trim()
      .nullable()
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' },
  );

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

// ─── Status update ────────────────────────────────────────────────────────────

export const updateOrganizationStatusSchema = z.object({
  status: z.nativeEnum(OrganizationStatus),
});

export type UpdateOrganizationStatusInput = z.infer<typeof updateOrganizationStatusSchema>;

// ─── Query parameters ─────────────────────────────────────────────────────────

export const listOrganizationsQuerySchema = z.object({
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(100).default(20),
  status:         z.nativeEnum(OrganizationStatus).optional(),
  industryTypeId: z.string().uuid().optional(),
});

export type ListOrganizationsQuery = z.infer<typeof listOrganizationsQuerySchema>;

// ─── Param schemas ────────────────────────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.string().uuid('Organization ID must be a valid UUID'),
});
