/**
 * Permission Service
 *
 * Implements IPermissionService.
 * All permission resolution goes through the cache-first strategy:
 *   1. Check Redis cache.
 *   2. On miss: query DB via repository, populate cache, return result.
 *
 * The service is unaware of HTTP — it receives user IDs and returns domain
 * objects. The middleware layer owns request/response handling.
 *
 * SOLID notes:
 *   - SRP: only resolves permissions, never touches roles directly.
 *   - OCP: cache and repository are injected — swap without changing this class.
 *   - DIP: depends on IPermissionCache and IPermissionRepository abstractions.
 */

import type { IPermissionService, IPermissionCache, IPermissionRepository, UserPermissions } from '../types/authorization.types';

export class PermissionService implements IPermissionService {
  constructor(
    private readonly repo:  IPermissionRepository,
    private readonly cache: IPermissionCache,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    // 1. Cache-first
    const cached = await this.cache.get(userId);
    if (cached !== null) {
      return { userId, permissionCodes: cached };
    }

    // 2. DB fallback
    const codes = await this.repo.findPermissionCodesByUserId(userId);

    // 3. Populate cache (fire-and-forget — don't let cache errors affect response)
    await this.cache.set(userId, codes);

    return { userId, permissionCodes: codes };
  }

  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const { permissionCodes } = await this.getUserPermissions(userId);
    return permissionCodes.has(permissionCode);
  }

  async hasAllPermissions(
    userId:          string,
    permissionCodes: readonly string[],
  ): Promise<boolean> {
    if (permissionCodes.length === 0) return true;
    const { permissionCodes: granted } = await this.getUserPermissions(userId);
    return permissionCodes.every((code) => granted.has(code));
  }

  async hasAnyPermission(
    userId:          string,
    permissionCodes: readonly string[],
  ): Promise<boolean> {
    if (permissionCodes.length === 0) return false;
    const { permissionCodes: granted } = await this.getUserPermissions(userId);
    return permissionCodes.some((code) => granted.has(code));
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.cache.invalidate(userId);
  }
}
