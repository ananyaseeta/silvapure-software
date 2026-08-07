/**
 * Role Constants
 *
 * Source of truth: prisma/seed/data/roles.ts (RBAC Specification v1).
 *
 * Re-exports the Prisma RoleCode enum values as named constants so the
 * authorization module never hard-codes string literals.
 *
 * Rules:
 *   - Never rename these — they map directly to RoleCode enum values.
 *   - Never add a value not present in the Prisma RoleCode enum.
 */

import { RoleCode } from '@prisma/client';

export const ROLE_ADMIN                = RoleCode.ADMIN                as const;
export const ROLE_PLANT_MANAGER        = RoleCode.PLANT_MANAGER        as const;
export const ROLE_ENVIRONMENTAL_OFFICER = RoleCode.ENVIRONMENTAL_OFFICER as const;
export const ROLE_OPERATOR             = RoleCode.OPERATOR             as const;
export const ROLE_VIEWER               = RoleCode.VIEWER               as const;

/** Tuple of all valid role codes — useful for runtime validation. */
export const ALL_ROLE_CODES = [
  ROLE_ADMIN,
  ROLE_PLANT_MANAGER,
  ROLE_ENVIRONMENTAL_OFFICER,
  ROLE_OPERATOR,
  ROLE_VIEWER,
] as const;

export type KnownRoleCode = (typeof ALL_ROLE_CODES)[number];
