/**
 * Authorize Middleware
 *
 * Factory functions that return Express middleware enforcing permission-based
 * or role-based access control on protected routes.
 *
 * Usage (in a route file):
 *
 *   import { authenticate }    from '../auth';
 *   import { requirePermission, requireRole } from '../authorization';
 *
 *   router.get('/plants',
 *     authenticate,
 *     requirePermission('plant.read'),
 *     handler,
 *   );
 *
 *   router.delete('/plants/:id',
 *     authenticate,
 *     requireAllPermissions(['plant.delete', 'plant.read']),
 *     handler,
 *   );
 *
 * Pre-conditions:
 *   - `authenticate` middleware MUST run first so that `req.user` is present.
 *   - These helpers never call `authenticate` — they only consume `req.user`.
 *
 * On failure:
 *   - Calls next(AuthorizationError) which is caught by the global handler.
 *   - Never responds directly — keeps error shaping in one place.
 *
 * Swagger note:
 *   Routes using these helpers should include `security: [{ bearerAuth: [] }]`
 *   and document the required permission in their JSDoc.
 *
 * @module authorize.middleware
 */

import type { Request, Response, NextFunction } from 'express';
import type { RoleCode } from '@prisma/client';
import { prisma }            from '../../../config/prisma';
import { getRedisClient }    from '../config/redis';
import { PermissionRepository } from '../repositories/permission.repository';
import { RedisPermissionCache } from '../cache/permission.cache';
import { PermissionService }    from '../services/permission.service';
import { RoleService }          from '../services/role.service';
import { AuthorizationError }   from '../errors/authorization.error';
import {
  AuthorizationErrorCode,
  type AuthorizedRequest,
} from '../types/authorization.types';
import type { AuthenticatedRequest } from '../../auth/types/auth.types';

// ─── Service factory (singleton per process) ──────────────────────────────────

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
    const repo  = new PermissionRepository(prisma);
    _roleService = new RoleService(repo);
  }
  return _roleService;
}

// ─── Guard: req.user must be present ─────────────────────────────────────────

function assertAuthenticated(req: Request): asserts req is AuthenticatedRequest {
  const r = req as Partial<AuthenticatedRequest>;
  if (!r.user?.id) {
    throw new AuthorizationError(
      AuthorizationErrorCode.USER_NOT_ATTACHED,
      'Authentication middleware must run before authorization middleware',
    );
  }
}

// ─── requirePermission ────────────────────────────────────────────────────────

/**
 * Requires the authenticated user to hold a single permission.
 *
 * @example
 * router.get('/alerts', authenticate, requirePermission('alert.read'), handler);
 *
 * @swagger
 * security:
 *   - bearerAuth: []
 * responses:
 *   403:
 *     $ref: '#/components/responses/Forbidden'
 */
export function requirePermission(permissionCode: string) {
  return async (
    req:  Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      assertAuthenticated(req);
      const userId = req.user.id;
      const svc    = getPermissionService();

      const granted = await svc.hasPermission(userId, permissionCode);
      if (!granted) {
        return next(
          new AuthorizationError(
            AuthorizationErrorCode.MISSING_PERMISSION,
            `Permission required: ${permissionCode}`,
          ),
        );
      }

      // Attach resolved permissions to request for downstream use
      const { permissionCodes } = await svc.getUserPermissions(userId);
      (req as AuthorizedRequest).permissions = permissionCodes;

      next();
    } catch (err) {
      next(err);
    }
  };
}

// ─── requireAnyPermission ─────────────────────────────────────────────────────

/**
 * Requires the authenticated user to hold AT LEAST ONE of the given permissions.
 *
 * @example
 * router.get('/reports',
 *   authenticate,
 *   requireAnyPermission(['report.read', 'report.export']),
 *   handler,
 * );
 *
 * @swagger
 * security:
 *   - bearerAuth: []
 * responses:
 *   403:
 *     $ref: '#/components/responses/Forbidden'
 */
export function requireAnyPermission(permissionCodes: readonly string[]) {
  return async (
    req:  Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      assertAuthenticated(req);
      const userId = req.user.id;
      const svc    = getPermissionService();

      const granted = await svc.hasAnyPermission(userId, permissionCodes);
      if (!granted) {
        return next(
          new AuthorizationError(
            AuthorizationErrorCode.MISSING_PERMISSION,
            `At least one of these permissions is required: ${permissionCodes.join(', ')}`,
          ),
        );
      }

      const { permissionCodes: allCodes } = await svc.getUserPermissions(userId);
      (req as AuthorizedRequest).permissions = allCodes;

      next();
    } catch (err) {
      next(err);
    }
  };
}

// ─── requireAllPermissions ────────────────────────────────────────────────────

/**
 * Requires the authenticated user to hold ALL of the given permissions.
 *
 * @example
 * router.delete('/devices/:id',
 *   authenticate,
 *   requireAllPermissions(['device.read', 'device.delete']),
 *   handler,
 * );
 *
 * @swagger
 * security:
 *   - bearerAuth: []
 * responses:
 *   403:
 *     $ref: '#/components/responses/Forbidden'
 */
export function requireAllPermissions(permissionCodes: readonly string[]) {
  return async (
    req:  Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      assertAuthenticated(req);
      const userId = req.user.id;
      const svc    = getPermissionService();

      const granted = await svc.hasAllPermissions(userId, permissionCodes);
      if (!granted) {
        return next(
          new AuthorizationError(
            AuthorizationErrorCode.MISSING_PERMISSION,
            `All of these permissions are required: ${permissionCodes.join(', ')}`,
          ),
        );
      }

      const { permissionCodes: allCodes } = await svc.getUserPermissions(userId);
      (req as AuthorizedRequest).permissions = allCodes;

      next();
    } catch (err) {
      next(err);
    }
  };
}

// ─── requireRole ─────────────────────────────────────────────────────────────

/**
 * Requires the authenticated user to hold a specific role.
 * Prefer permission-based checks over role checks for finer granularity.
 * Use role checks only when the entire role semantics are required
 * (e.g. "only ADMINs can access billing").
 *
 * @example
 * router.get('/admin/billing',
 *   authenticate,
 *   requireRole('ADMIN'),
 *   handler,
 * );
 *
 * @swagger
 * security:
 *   - bearerAuth: []
 * responses:
 *   403:
 *     $ref: '#/components/responses/Forbidden'
 */
export function requireRole(roleCode: RoleCode) {
  return async (
    req:  Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      assertAuthenticated(req);
      const userId = req.user.id;
      const svc    = getRoleService();

      const hasIt = await svc.hasRole(userId, roleCode);
      if (!hasIt) {
        return next(
          new AuthorizationError(
            AuthorizationErrorCode.MISSING_ROLE,
            `Role required: ${roleCode}`,
          ),
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
