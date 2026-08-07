/**
 * Role Service
 *
 * Implements IRoleService.
 * Thin wrapper over the repository — role lookups are infrequent relative to
 * permission checks, so no caching layer is applied here. If role-check hot
 * paths emerge, add a separate role cache without touching this interface.
 */

import type { RoleCode } from '@prisma/client';
import type { IRoleService, IPermissionRepository, Role } from '../types/authorization.types';

export class RoleService implements IRoleService {
  constructor(private readonly repo: IPermissionRepository) {}

  async getUserRoles(userId: string): Promise<Role[]> {
    return this.repo.findRolesByUserId(userId);
  }

  async hasRole(userId: string, roleCode: RoleCode): Promise<boolean> {
    const roles = await this.repo.findRolesByUserId(userId);
    return roles.some((r) => r.code === roleCode);
  }
}
