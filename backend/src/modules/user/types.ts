/**
 * User Module — Domain Types
 *
 * All interfaces, DTOs, and error types for the user module.
 * Prisma types are never exposed outside the repository layer.
 */

import type { UserStatus, RoleCode } from '@prisma/client';

// ─── Read projections ─────────────────────────────────────────────────────────

export interface UserRoleRecord {
  roleId:   string;
  roleCode: RoleCode;
  roleName: string;
}

export interface UserRecord {
  id:             string;
  organizationId: string;
  firstName:      string;
  lastName:       string | null;
  email:          string;
  phone:          string | null;
  jobTitle:       string | null;
  status:         UserStatus;
  roles:          UserRoleRecord[];
  createdAt:      Date;
  updatedAt:      Date;
}

/** Lightweight list projection used in paginated responses. */
export interface UserSummary {
  id:             string;
  organizationId: string;
  firstName:      string;
  lastName:       string | null;
  email:          string;
  jobTitle:       string | null;
  status:         UserStatus;
  roles:          RoleCode[];
  createdAt:      Date;
}

// ─── Write DTOs ───────────────────────────────────────────────────────────────

export interface CreateUserDto {
  organizationId: string;
  firstName:      string;
  lastName?:      string;
  email:          string;
  password:       string;
  phone?:         string;
  jobTitle?:      string;
  roles?:         RoleCode[];
}

export interface UpdateUserDto {
  firstName?:  string;
  lastName?:   string | null;
  phone?:      string | null;
  jobTitle?:   string | null;
}

export interface UpdateUserStatusDto {
  status: UserStatus;
}

export interface AssignRolesDto {
  roles: RoleCode[];
}

// ─── Pagination (shared with org module) ─────────────────────────────────────

export interface UserPaginationParams {
  page:  number;
  limit: number;
}

export interface UserPaginatedResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

// ─── Error codes ─────────────────────────────────────────────────────────────

export const UserErrorCode = {
  NOT_FOUND:          'USER_NOT_FOUND',
  EMAIL_TAKEN:        'USER_EMAIL_TAKEN',
  ORG_NOT_FOUND:      'USER_ORG_NOT_FOUND',
  ROLE_NOT_FOUND:     'USER_ROLE_NOT_FOUND',
  CANNOT_DELETE_SELF: 'USER_CANNOT_DELETE_SELF',
  PASSWORD_WEAK:      'USER_PASSWORD_WEAK',
} as const;

export type UserErrorCode = (typeof UserErrorCode)[keyof typeof UserErrorCode];

// ─── Domain error ─────────────────────────────────────────────────────────────

export class UserError extends Error {
  public readonly code:       UserErrorCode;
  public readonly statusHint: number;

  constructor(code: UserErrorCode, message: string, statusHint = 400) {
    super(message);
    this.name       = 'UserError';
    this.code       = code;
    this.statusHint = statusHint;
  }
}
