import type { RoleCode } from '@prisma/client';
import type { Request } from 'express';
import type { AuthUser } from '../../auth/types/auth.types';

export interface Permission {
  id:          string;
  code:        string;
  name:        string;
  module:      string;
  description: string | null;
}

export interface Role {
  id:          string;
  code:        RoleCode;
  name:        string;
  description: string | null;
}

export interface UserPermissions {
  userId:          string;
  permissionCodes: ReadonlySet<string>;
}

export interface IPermissionCache {
  get(userId: string): Promise<ReadonlySet<string> | null>;
  set(userId: string, codes: ReadonlySet<string>): Promise<void>;
  invalidate(userId: string): Promise<void>;
  invalidateAll(): Promise<void>;
}

export interface IPermissionRepository {
  findPermissionCodesByUserId(userId: string): Promise<ReadonlySet<string>>;
  findRolesByUserId(userId: string): Promise<Role[]>;
}

export interface IPermissionService {
  getUserPermissions(userId: string): Promise<UserPermissions>;
  hasPermission(userId: string, permissionCode: string): Promise<boolean>;
  hasAllPermissions(userId: string, permissionCodes: readonly string[]): Promise<boolean>;
  hasAnyPermission(userId: string, permissionCodes: readonly string[]): Promise<boolean>;
  invalidateUserCache(userId: string): Promise<void>;
}

export interface IRoleService {
  getUserRoles(userId: string): Promise<Role[]>;
  hasRole(userId: string, roleCode: RoleCode): Promise<boolean>;
}

export interface AuthorizedRequest extends Request {
  user:        AuthUser;
  permissions: ReadonlySet<string>;
}

export const AuthorizationErrorCode = {
  FORBIDDEN:          'AUTHZ_FORBIDDEN',
  MISSING_PERMISSION: 'AUTHZ_MISSING_PERMISSION',
  MISSING_ROLE:       'AUTHZ_MISSING_ROLE',
  USER_NOT_ATTACHED:  'AUTHZ_USER_NOT_ATTACHED',
} as const;

export type AuthorizationErrorCode = (typeof AuthorizationErrorCode)[keyof typeof AuthorizationErrorCode];
