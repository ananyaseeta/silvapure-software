import { RoleCode } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { AuthUser } from '../auth/types/auth.types';

/**
 * OrgScopeService
 *
 * Determines whether an authenticated user is allowed to access a specific
 * organization resource.
 *
 * Access rules (derived from rolePermissionMappings.ts RBAC spec):
 *   - ADMIN: full cross-organization access (covers Platform Admin + Org Admin)
 *   - All other roles: restricted to their own organization only
 *
 * The service uses a direct Prisma query to check role assignment rather than
 * the Redis-backed PermissionService. This avoids coupling the scope check to
 * the permission cache and keeps the logic self-contained.
 */
export class OrgScopeService {
  /**
   * Returns true if the user may access the given organization.
   *
   * ADMINs can access any organization.
   * All other users can only access the organization stored on their own
   * AuthUser.organizationId (which was validated by authenticate middleware).
   *
   * @param user          - Authenticated user from req.user
   * @param organizationId - The organization being accessed
   */
  async canAccess(user: AuthUser, organizationId: string): Promise<boolean> {
    const isAdmin = await this.isAdmin(user.id);
    if (isAdmin) return true;
    return user.organizationId === organizationId;
  }

  /**
   * Returns true if the user is scoped to all organizations (i.e. is ADMIN).
   * Used by the list endpoint to decide whether to filter results.
   */
  async isAdmin(userId: string): Promise<boolean> {
    const row = await prisma.userRole.findFirst({
      where: { userId, role: { code: RoleCode.ADMIN } },
      select: { userId: true },
    });
    return row !== null;
  }
}

// Singleton — one instance shared across requests in the same process
export const orgScopeService = new OrgScopeService();
