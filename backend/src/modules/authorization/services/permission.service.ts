import type { IPermissionService, IPermissionCache, IPermissionRepository, UserPermissions } from '../types/authorization.types';

export class PermissionService implements IPermissionService {
  constructor(
    private readonly repo:  IPermissionRepository,
    private readonly cache: IPermissionCache,
  ) {}

  async getUserPermissions(userId: string): Promise<UserPermissions> {
    const cached = await this.cache.get(userId);
    if (cached !== null) return { userId, permissionCodes: cached };

    const codes = await this.repo.findPermissionCodesByUserId(userId);
    await this.cache.set(userId, codes);
    return { userId, permissionCodes: codes };
  }

  async hasPermission(userId: string, permissionCode: string): Promise<boolean> {
    const { permissionCodes } = await this.getUserPermissions(userId);
    return permissionCodes.has(permissionCode);
  }

  async hasAllPermissions(userId: string, permissionCodes: readonly string[]): Promise<boolean> {
    if (permissionCodes.length === 0) return true;
    const { permissionCodes: granted } = await this.getUserPermissions(userId);
    return permissionCodes.every((code) => granted.has(code));
  }

  async hasAnyPermission(userId: string, permissionCodes: readonly string[]): Promise<boolean> {
    if (permissionCodes.length === 0) return false;
    const { permissionCodes: granted } = await this.getUserPermissions(userId);
    return permissionCodes.some((code) => granted.has(code));
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.cache.invalidate(userId);
  }
}
