/**
 * Authorization Module Barrel
 *
 * Public surface of the authorization module.
 * Internal plumbing (repository, cache, redis config) is not re-exported —
 * consumers use only what they need at the route layer.
 */

// ── Middleware helpers ────────────────────────────────────────────────────────
export {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
} from './middleware/authorize.middleware';

// ── Domain error (consumed by app.ts global handler) ─────────────────────────
export { AuthorizationError } from './errors/authorization.error';

// ── Services (for use in controllers that need explicit checks) ───────────────
export { PermissionService } from './services/permission.service';
export { RoleService }       from './services/role.service';

// ── Repository (for DI / testing) ────────────────────────────────────────────
export { PermissionRepository } from './repositories/permission.repository';

// ── Cache implementations ─────────────────────────────────────────────────────
export { RedisPermissionCache, NullPermissionCache } from './cache/permission.cache';

// ── Redis client ──────────────────────────────────────────────────────────────
export { getRedisClient, closeRedisClient } from './config/redis';

// ── Constants ─────────────────────────────────────────────────────────────────
export * from './constants/permissions';
export * from './constants/roles';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  Permission,
  Role,
  UserPermissions,
  IPermissionCache,
  IPermissionRepository,
  IPermissionService,
  IRoleService,
  AuthorizedRequest,
} from './types/authorization.types';
export { AuthorizationErrorCode } from './types/authorization.types';
