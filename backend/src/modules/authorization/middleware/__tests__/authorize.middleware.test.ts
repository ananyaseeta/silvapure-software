/**
 * Unit tests — authorize middleware
 * (requirePermission, requireAnyPermission, requireAllPermissions, requireRole)
 *
 * The authorize middleware uses module-level service singletons. To prevent
 * state leaking between describe blocks, we use jest.isolateModules() to get
 * a fresh module copy for each group, and inject mocked service instances by
 * controlling the constructors the middleware's factory functions call.
 */

// ── env bootstrap ─────────────────────────────────────────────────────────────
process.env['NODE_ENV']                  = 'test';
process.env['DATABASE_URL']              = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET']         = 'test-access-secret-at-least-32-chars!!';
process.env['JWT_REFRESH_SECRET']        = 'test-refresh-secret-at-least-32-chars!';
process.env['REDIS_URL']                 = 'redis://localhost:6379';
process.env['REDIS_PERMISSION_TTL_SEC']  = '300';
process.env['ARGON2_MEMORY_COST']        = '64';
process.env['ARGON2_TIME_COST']          = '1';
process.env['ARGON2_PARALLELISM']        = '1';

import { RoleCode, UserStatus } from '@prisma/client';
import { AuthorizationErrorCode } from '../../types/authorization.types';
import { AuthorizationError }     from '../../errors/authorization.error';
import type { Request, Response, NextFunction } from 'express';

// ─── Test helpers ──────────────────────────────────────────────────────────────

function makeAuthedRequest(userId = 'user-uuid-001'): Request {
  return {
    user: {
      id:             userId,
      email:          'user@silvapure.io',
      organizationId: 'org-uuid-001',
      status:         UserStatus.ACTIVE,
    },
  } as unknown as Request;
}

function makeUnauthRequest(): Request {
  return {} as unknown as Request;
}

function makeResponse(): { res: Response; json: jest.Mock; status: jest.Mock } {
  const json   = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status, json } as unknown as Response, json, status };
}

// ─── AuthorizationError unit tests (no middleware singleton needed) ───────────

describe('AuthorizationError', () => {
  it('has statusHint of 403', () => {
    const err = new AuthorizationError(AuthorizationErrorCode.FORBIDDEN, 'forbidden');
    expect(err.statusHint).toBe(403);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('AuthorizationError');
  });

  it('exposes the code property', () => {
    const err = new AuthorizationError(AuthorizationErrorCode.MISSING_PERMISSION, 'no perm');
    expect(err.code).toBe(AuthorizationErrorCode.MISSING_PERMISSION);
    expect(err.message).toBe('no perm');
  });
});

// ─── requirePermission ────────────────────────────────────────────────────────

describe('requirePermission', () => {
  // Fresh module isolation per describe so singletons reset
  let requirePermission: (code: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let mockHasPermission:     jest.Mock;
  let mockGetUserPermissions: jest.Mock;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    next = jest.fn();

    mockHasPermission      = jest.fn().mockResolvedValue(true);
    mockGetUserPermissions = jest.fn().mockResolvedValue({
      userId:          'user-uuid-001',
      permissionCodes: new Set(['plant.read', 'sensor.read']),
    });

    jest.isolateModules(() => {
      jest.mock('../../../../config/prisma',          () => ({ prisma: {} }));
      jest.mock('../../config/redis',                 () => ({ getRedisClient: jest.fn().mockReturnValue({}) }));
      jest.mock('../../repositories/permission.repository', () => ({
        PermissionRepository: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../cache/permission.cache', () => ({
        RedisPermissionCache: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../services/permission.service', () => ({
        PermissionService: jest.fn().mockImplementation(() => ({
          hasPermission:       mockHasPermission,
          hasAllPermissions:   jest.fn().mockResolvedValue(true),
          hasAnyPermission:    jest.fn().mockResolvedValue(true),
          getUserPermissions:  mockGetUserPermissions,
          invalidateUserCache: jest.fn(),
        })),
      }));
      jest.mock('../../services/role.service', () => ({
        RoleService: jest.fn().mockImplementation(() => ({
          hasRole:      jest.fn().mockResolvedValue(true),
          getUserRoles: jest.fn().mockResolvedValue([]),
        })),
      }));

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      requirePermission = require('../authorize.middleware').requirePermission;
    });
  });

  it('calls next() when user has the required permission', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requirePermission('plant.read')(req, res, next);
    expect(next).toHaveBeenCalledWith(/* no args */);
  });

  it('attaches req.permissions when permission is granted', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requirePermission('plant.read')(req, res, next);
    const r = req as Request & { permissions: ReadonlySet<string> };
    expect(r.permissions).toBeDefined();
    expect(r.permissions.has('plant.read')).toBe(true);
  });

  it('calls next(AuthorizationError) when permission is denied', async () => {
    mockHasPermission.mockResolvedValue(false);
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requirePermission('plant.delete')(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.MISSING_PERMISSION, statusHint: 403 }),
    );
  });

  it('calls next(AuthorizationError) when req.user is absent', async () => {
    const req = makeUnauthRequest();
    const { res } = makeResponse();
    await requirePermission('plant.read')(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.USER_NOT_ATTACHED }),
    );
  });

  it('passes error to next() when PermissionService.hasPermission throws', async () => {
    mockHasPermission.mockRejectedValue(new Error('DB failed'));
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requirePermission('plant.read')(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── requireAnyPermission ─────────────────────────────────────────────────────

describe('requireAnyPermission', () => {
  let requireAnyPermission: (codes: readonly string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let mockHasAny:   jest.Mock;
  let mockGetPerms: jest.Mock;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    next         = jest.fn();
    mockHasAny   = jest.fn().mockResolvedValue(true);
    mockGetPerms = jest.fn().mockResolvedValue({
      userId: 'user-uuid-001',
      permissionCodes: new Set(['report.read']),
    });

    jest.isolateModules(() => {
      jest.mock('../../../../config/prisma',          () => ({ prisma: {} }));
      jest.mock('../../config/redis',                 () => ({ getRedisClient: jest.fn().mockReturnValue({}) }));
      jest.mock('../../repositories/permission.repository', () => ({
        PermissionRepository: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../cache/permission.cache', () => ({
        RedisPermissionCache: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../services/permission.service', () => ({
        PermissionService: jest.fn().mockImplementation(() => ({
          hasPermission:       jest.fn(),
          hasAllPermissions:   jest.fn(),
          hasAnyPermission:    mockHasAny,
          getUserPermissions:  mockGetPerms,
          invalidateUserCache: jest.fn(),
        })),
      }));
      jest.mock('../../services/role.service', () => ({
        RoleService: jest.fn().mockImplementation(() => ({
          hasRole: jest.fn(), getUserRoles: jest.fn(),
        })),
      }));
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      requireAnyPermission = require('../authorize.middleware').requireAnyPermission;
    });
  });

  it('calls next() when user has at least one permission', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireAnyPermission(['report.read', 'report.export'])(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('attaches req.permissions on success', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireAnyPermission(['report.read'])(req, res, next);
    const r = req as Request & { permissions?: ReadonlySet<string> };
    expect(r.permissions).toBeDefined();
  });

  it('calls next(AuthorizationError) when user has none', async () => {
    mockHasAny.mockResolvedValue(false);
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireAnyPermission(['ai.train', 'ai.deploy'])(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.MISSING_PERMISSION }),
    );
  });

  it('calls next(AuthorizationError) when req.user is absent', async () => {
    const req = makeUnauthRequest();
    const { res } = makeResponse();
    await requireAnyPermission(['report.read'])(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.USER_NOT_ATTACHED }),
    );
  });
});

// ─── requireAllPermissions ────────────────────────────────────────────────────

describe('requireAllPermissions', () => {
  let requireAllPermissions: (codes: readonly string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let mockHasAll:   jest.Mock;
  let mockGetPerms: jest.Mock;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    next         = jest.fn();
    mockHasAll   = jest.fn().mockResolvedValue(true);
    mockGetPerms = jest.fn().mockResolvedValue({
      userId: 'user-uuid-001',
      permissionCodes: new Set(['device.read', 'device.delete']),
    });

    jest.isolateModules(() => {
      jest.mock('../../../../config/prisma',          () => ({ prisma: {} }));
      jest.mock('../../config/redis',                 () => ({ getRedisClient: jest.fn().mockReturnValue({}) }));
      jest.mock('../../repositories/permission.repository', () => ({
        PermissionRepository: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../cache/permission.cache', () => ({
        RedisPermissionCache: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../services/permission.service', () => ({
        PermissionService: jest.fn().mockImplementation(() => ({
          hasPermission:       jest.fn(),
          hasAllPermissions:   mockHasAll,
          hasAnyPermission:    jest.fn(),
          getUserPermissions:  mockGetPerms,
          invalidateUserCache: jest.fn(),
        })),
      }));
      jest.mock('../../services/role.service', () => ({
        RoleService: jest.fn().mockImplementation(() => ({
          hasRole: jest.fn(), getUserRoles: jest.fn(),
        })),
      }));
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      requireAllPermissions = require('../authorize.middleware').requireAllPermissions;
    });
  });

  it('calls next() when user has all required permissions', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireAllPermissions(['device.read', 'device.delete'])(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('attaches req.permissions on success', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireAllPermissions(['device.read'])(req, res, next);
    const r = req as Request & { permissions?: ReadonlySet<string> };
    expect(r.permissions).toBeInstanceOf(Set);
  });

  it('calls next(AuthorizationError) when user is missing at least one', async () => {
    mockHasAll.mockResolvedValue(false);
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireAllPermissions(['device.read', 'device.delete'])(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.MISSING_PERMISSION }),
    );
  });

  it('calls next(AuthorizationError) when req.user is absent', async () => {
    const req = makeUnauthRequest();
    const { res } = makeResponse();
    await requireAllPermissions(['device.read'])(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.USER_NOT_ATTACHED }),
    );
  });
});

// ─── requireRole ─────────────────────────────────────────────────────────────

describe('requireRole', () => {
  let requireRole: (code: RoleCode) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  let mockHasRole: jest.Mock;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    next        = jest.fn();
    mockHasRole = jest.fn().mockResolvedValue(true);

    jest.isolateModules(() => {
      jest.mock('../../../../config/prisma',          () => ({ prisma: {} }));
      jest.mock('../../config/redis',                 () => ({ getRedisClient: jest.fn().mockReturnValue({}) }));
      jest.mock('../../repositories/permission.repository', () => ({
        PermissionRepository: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../cache/permission.cache', () => ({
        RedisPermissionCache: jest.fn().mockImplementation(() => ({})),
      }));
      jest.mock('../../services/permission.service', () => ({
        PermissionService: jest.fn().mockImplementation(() => ({
          hasPermission: jest.fn(), hasAllPermissions: jest.fn(),
          hasAnyPermission: jest.fn(), getUserPermissions: jest.fn(),
          invalidateUserCache: jest.fn(),
        })),
      }));
      jest.mock('../../services/role.service', () => ({
        RoleService: jest.fn().mockImplementation(() => ({
          hasRole:      mockHasRole,
          getUserRoles: jest.fn().mockResolvedValue([]),
        })),
      }));
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      requireRole = require('../authorize.middleware').requireRole;
    });
  });

  it('calls next() when user holds the required role', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireRole(RoleCode.ADMIN)(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(AuthorizationError) when user does not hold the role', async () => {
    mockHasRole.mockResolvedValue(false);
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireRole(RoleCode.ADMIN)(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.MISSING_ROLE, statusHint: 403 }),
    );
  });

  it('calls next(AuthorizationError) when req.user is absent', async () => {
    const req = makeUnauthRequest();
    const { res } = makeResponse();
    await requireRole(RoleCode.PLANT_MANAGER)(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.USER_NOT_ATTACHED }),
    );
  });

  it('calls RoleService.hasRole with the correct userId and roleCode', async () => {
    const req = makeAuthedRequest('specific-user-id');
    const { res } = makeResponse();
    await requireRole(RoleCode.ENVIRONMENTAL_OFFICER)(req, res, next);
    expect(mockHasRole).toHaveBeenCalledWith('specific-user-id', RoleCode.ENVIRONMENTAL_OFFICER);
  });

  it('does not attach req.permissions (role check does not resolve permission set)', async () => {
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireRole(RoleCode.ADMIN)(req, res, next);
    const r = req as Request & { permissions?: ReadonlySet<string> };
    expect(r.permissions).toBeUndefined();
  });

  it('passes error to next() when RoleService throws', async () => {
    mockHasRole.mockRejectedValue(new Error('DB failed'));
    const req = makeAuthedRequest();
    const { res } = makeResponse();
    await requireRole(RoleCode.ADMIN)(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
