import type { Request, Response, NextFunction } from 'express';
import type { RoleCode } from '@prisma/client';
import { prisma }               from '../../../config/prisma';
import { getRedisClient }       from '../config/redis';
import { PermissionRepository } from '../repositories/permission.repository';
import { RedisPermissionCache } from '../cache/permission.cache';
import { PermissionService }    from '../services/permission.service';
import { RoleService }          from '../services/role.service';
import { AuthorizationError }   from '../errors/authorization.error';
import { AuthorizationErrorCode, type AuthorizedRequest } from '../types/authorization.types';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';

let _permissionService: PermissionService | null = null;
let _roleService:       RoleService       | null = null;

function getPermissionService(): PermissionService {
  if (!_permissionService) {
    const repo  = new PermissionRepository(prisma);
    const cache = new RedisPermissionCache(getRedisClient());
    _permissionService = new PermissionService(repo, cache);
  }
  return _permissionService;
}

function getRoleService(): RoleService {
  if (!_roleService) {
    _roleService = new RoleService(new PermissionRepository(prisma));
  }
  return _roleService;
}

function assertAuthenticated(req: Request): asserts req is AuthenticatedRequest {
  const r = req as Partial<AuthenticatedRequest>;
  if (!r.user?.id) {
    throw new AuthorizationError(
      AuthorizationErrorCode.USER_NOT_ATTACHED,
      'Authentication middleware must run before authorization middleware',
    );
  }
}

/**
 * @swagger
 * security:
 *   - bearerAuth: []
 * responses:
 *   403:
 *     $ref: '#/components/responses/Forbidden'
 */
export function requirePermission(permissionCode: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAuthenticated(req);
      const svc     = getPermissionService();
      const granted = await svc.hasPermission(req.user.id, permissionCode);

      if (!granted) {
        return next(new AuthorizationError(AuthorizationErrorCode.MISSING_PERMISSION, `Permission required: ${permissionCode}`));
      }

      const { permissionCodes } = await svc.getUserPermissions(req.user.id);
      (req as AuthorizedRequest).permissions = permissionCodes;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireAnyPermission(permissionCodes: readonly string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAuthenticated(req);
      const svc     = getPermissionService();
      const granted = await svc.hasAnyPermission(req.user.id, permissionCodes);

      if (!granted) {
        return next(new AuthorizationError(AuthorizationErrorCode.MISSING_PERMISSION, `At least one of these permissions is required: ${permissionCodes.join(', ')}`));
      }

      const { permissionCodes: allCodes } = await svc.getUserPermissions(req.user.id);
      (req as AuthorizedRequest).permissions = allCodes;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireAllPermissions(permissionCodes: readonly string[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAuthenticated(req);
      const svc     = getPermissionService();
      const granted = await svc.hasAllPermissions(req.user.id, permissionCodes);

      if (!granted) {
        return next(new AuthorizationError(AuthorizationErrorCode.MISSING_PERMISSION, `All of these permissions are required: ${permissionCodes.join(', ')}`));
      }

      const { permissionCodes: allCodes } = await svc.getUserPermissions(req.user.id);
      (req as AuthorizedRequest).permissions = allCodes;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRole(roleCode: RoleCode) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      assertAuthenticated(req);
      const hasIt = await getRoleService().hasRole(req.user.id, roleCode);

      if (!hasIt) {
        return next(new AuthorizationError(AuthorizationErrorCode.MISSING_ROLE, `Role required: ${roleCode}`));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
