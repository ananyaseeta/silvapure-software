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

jest.mock('../../../config/prisma', () => ({ prisma: {} }));
jest.mock('../scope.service');

import type { Request, Response, NextFunction } from 'express';
import { UserStatus }         from '@prisma/client';
import { requireOrgScope }    from '../scope.middleware';
import { OrgScopeService, orgScopeService } from '../scope.service';
import { AuthorizationErrorCode } from '../../authorization/types/authorization.types';

const MockedOrgScopeService = OrgScopeService as jest.MockedClass<typeof OrgScopeService>;

// ─── UUID fixtures ─────────────────────────────────────────────────────────────
const ORG_A      = 'a1b2c3d4-e5f6-4789-a012-b34c56d78e90';
const ORG_B      = 'b2c3d4e5-f6a7-4890-b123-c45d67e89f01';
const USER_ID    = 'c3d4e5f6-a7b8-4901-c234-d56e78f90a12';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeReq(orgId: string, params: Record<string, string> = {}): Request {
  return {
    user:   { id: USER_ID, email: 'u@test.io', organizationId: orgId, status: UserStatus.ACTIVE },
    params: { id: ORG_A, ...params },
    headers: {},
  } as unknown as Request;
}

function makeUnauthReq(): Request {
  return { params: { id: ORG_A }, headers: {} } as unknown as Request;
}

function makeRes(): Response {
  return {} as unknown as Response;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('requireOrgScope middleware', () => {
  let next: jest.MockedFunction<NextFunction>;
  let mockCanAccess: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    mockCanAccess = jest.fn().mockResolvedValue(true);
    MockedOrgScopeService.mockImplementation(() => ({
      canAccess: mockCanAccess,
      isAdmin:   jest.fn().mockResolvedValue(false),
    } as unknown as OrgScopeService));

    // Override the module-level singleton used by the middleware
    (orgScopeService as jest.Mocked<typeof orgScopeService>).canAccess = mockCanAccess;
  });

  it('calls next() when user belongs to the same organization', async () => {
    mockCanAccess.mockResolvedValue(true);
    await requireOrgScope(makeReq(ORG_A), makeRes(), next);
    expect(next).toHaveBeenCalledWith(/* no args */);
  });

  it('calls next(AuthorizationError FORBIDDEN) when user belongs to a different organization', async () => {
    mockCanAccess.mockResolvedValue(false);
    await requireOrgScope(makeReq(ORG_B), makeRes(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.FORBIDDEN, statusHint: 403 }),
    );
  });

  it('calls next(AuthorizationError USER_NOT_ATTACHED) when req.user is absent', async () => {
    await requireOrgScope(makeUnauthReq(), makeRes(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: AuthorizationErrorCode.USER_NOT_ATTACHED }),
    );
  });

  it('calls next() without checking access when :id is not a valid UUID (passes to controller)', async () => {
    const req = makeReq(ORG_A, { id: 'not-a-uuid' });
    await requireOrgScope(req, makeRes(), next);
    expect(mockCanAccess).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(/* no args */);
  });

  it('calls next(err) when orgScopeService.canAccess throws an unexpected error', async () => {
    mockCanAccess.mockRejectedValue(new Error('DB down'));
    await requireOrgScope(makeReq(ORG_A), makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('allows ADMIN to access a different organization (canAccess returns true for ADMIN)', async () => {
    mockCanAccess.mockResolvedValue(true);
    const req = makeReq(ORG_A, { id: ORG_B });
    await requireOrgScope(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls canAccess with the correct user and organizationId from params', async () => {
    mockCanAccess.mockResolvedValue(true);
    const req = makeReq(ORG_A, { id: ORG_A });
    await requireOrgScope(req, makeRes(), next);
    expect(mockCanAccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: USER_ID, organizationId: ORG_A }),
      ORG_A,
    );
  });
});
