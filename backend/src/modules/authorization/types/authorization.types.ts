/**
 * Authorization Domain Types
 *
 * All interfaces and types used across the authorization module.
 * Prisma types are never exposed directly — repository/service layers map them.
 */

import type { RoleCode } from '@prisma/client';
import type { Request } from 'express';
import type { AuthUser } from '../../auth/types/auth.types';

// ─── Permission ───────────────────────────────────────────────────────────────

/** A single permission record as the domain layer sees it. */
export interface Permission {
  id:          string;
  code:        string;
  name:        string;
  module:      string;
  description: string | null;
}

// ─── Role ─────────────────────────────────────────────────────────────────────

/** A single role record as the domain layer sees it. */
export interface Role {
  id:          string;
  code:        RoleCode;
  name:        string;
  description: string | null;
}

// ─── User permission projection ───────────────────────────────────────────────

/**
 * The resolved permission set for a user — a flat set of permission codes.
 * Computed by unioning all permissions across every role the user holds.
 */
export interface UserPermissions {
  userId:          string;
  permissionCodes: ReadonlySet<string>;
}

// ─── Cache port ───────────────────────────────────────────────────────────────

/**
 * Interface that any permission cache implementation must satisfy.
 * Follows the Dependency Inversion Principle — the service depends on
 * this abstraction, not on a concrete Redis/in-memory implementation.
 */
export interface IPermissionCache {
  /**
   * Returns the cached permission-code set for a user, or null on cache miss.
   */
  get(userId: string): Promise<ReadonlySet<string> | null>;

  /**
   * Stores the permission-code set for a user with the configured TTL.
   */
  set(userId: string, codes: ReadonlySet<string>): Promise<void>;

  /**
   * Invalidates the cached entry for a specific user.
   * Call after role or permission changes affecting that user.
   */
  invalidate(userId: string): Promise<void>;

  /**
   * Invalidates all permission cache entries.
   * Call after a permission matrix change (e.g. role definition update).
   */
  invalidateAll(): Promise<void>;
}

// ─── Repository port ──────────────────────────────────────────────────────────

/** Contract for the authorization repository. */
export interface IPermissionRepository {
  /** Returns all permission codes granted to a user via their roles. */
  findPermissionCodesByUserId(userId: string): Promise<ReadonlySet<string>>;

  /** Returns all roles held by a user. */
  findRolesByUserId(userId: string): Promise<Role[]>;
}

// ─── Service contracts ────────────────────────────────────────────────────────

export interface IPermissionService {
  /** Returns the resolved permission set for a user (cache-first). */
  getUserPermissions(userId: string): Promise<UserPermissions>;

  /** Returns true if the user holds the given permission. */
  hasPermission(userId: string, permissionCode: string): Promise<boolean>;

  /** Returns true if the user holds ALL of the given permissions. */
  hasAllPermissions(userId: string, permissionCodes: readonly string[]): Promise<boolean>;

  /** Returns true if the user holds ANY of the given permissions. */
  hasAnyPermission(userId: string, permissionCodes: readonly string[]): Promise<boolean>;

  /** Evicts the user's cached permissions. */
  invalidateUserCache(userId: string): Promise<void>;
}

export interface IRoleService {
  /** Returns all roles held by a user. */
  getUserRoles(userId: string): Promise<Role[]>;

  /** Returns true if the user holds the given role code. */
  hasRole(userId: string, roleCode: RoleCode): Promise<boolean>;
}

// ─── Augmented request ────────────────────────────────────────────────────────

/**
 * Express Request extended with both the authenticated user (from auth
 * middleware) and their resolved permission set (attached by authorize helper).
 */
export interface AuthorizedRequest extends Request {
  user:        AuthUser;
  permissions: ReadonlySet<string>;
}

// ─── Error codes ──────────────────────────────────────────────────────────────

export const AuthorizationErrorCode = {
  FORBIDDEN:           'AUTHZ_FORBIDDEN',
  MISSING_PERMISSION:  'AUTHZ_MISSING_PERMISSION',
  MISSING_ROLE:        'AUTHZ_MISSING_ROLE',
  USER_NOT_ATTACHED:   'AUTHZ_USER_NOT_ATTACHED',
} as const;

export type AuthorizationErrorCode =
  (typeof AuthorizationErrorCode)[keyof typeof AuthorizationErrorCode];
