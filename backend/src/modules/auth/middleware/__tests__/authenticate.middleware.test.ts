/**
 * Unit tests — authenticate middleware
 *
 * The Prisma client and AuthRepository are mocked so no real DB calls are made.
 * Real JWT signing/verification is used so token behaviour is accurate.
 */

// ── bootstrap env before any module imports ───────────────────────────────────
process.env['NODE_ENV']                  = 'test';
process.env['DATABASE_URL']              = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET']         = 'test-access-secret-at-least-32-chars!!';
process.env['JWT_REFRESH_SECRET']        = 'test-refresh-secret-at-least-32-chars!';
process.env['JWT_ACCESS_EXPIRES_IN']     = '15m';
process.env['JWT_REFRESH_EXPIRES_IN']    = '7d';
process.env['ARGON2_MEMORY_COST']        = '64';
process.env['ARGON2_TIME_COST']          = '1';
process.env['ARGON2_PARALLELISM']        = '1';

// ── Mock Prisma (no DB connection needed) ─────────────────────────────────────
jest.mock('../../../../config/prisma', () => ({ prisma: {} }));

// ── Mock AuthRepository with a factory that captures an updatable spy ─────────
// jest.mock is hoisted, so we cannot reference variables declared below.
// Instead, we mock the entire module and control the instance methods in tests.
jest.mock('../../repositories/auth.repository');

import type { Request, Response, NextFunction } from 'express';
import { UserStatus } from '@prisma/client';
import { authenticate } from '../authenticate.middleware';
import { AuthRepository } from '../../repositories/auth.repository';
import { signAccessToken } from '../../utils/jwt';
import { AuthErrorCode } from '../../types/auth.types';
import type { AuthUserRecord } from '../../types/auth.types';

const MockedAuthRepository = AuthRepository as jest.MockedClass<typeof AuthRepository>;

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeActiveUser(): AuthUserRecord {
  return {
    id:             'user-uuid-001',
    email:          'user@silvapure.io',
    passwordHash:   '$argon2id$hash',
    organizationId: 'org-uuid-001',
    status:         UserStatus.ACTIVE,
    firstName:      'Jane',
    lastName:       'Doe',
  };
}

function makeRequest(authHeader?: string): Request {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
  } as unknown as Request;
}

function makeResponse(): { res: Response; json: jest.Mock; status: jest.Mock } {
  const json   = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json });
  const res    = { status, json } as unknown as Response;
  return { res, json, status };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('authenticate middleware', () => {
  let next: jest.MockedFunction<NextFunction>;
  let mockFindUserById: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    mockFindUserById = jest.fn().mockResolvedValue(makeActiveUser());

    MockedAuthRepository.mockImplementation(() => ({
      findUserById:    mockFindUserById,
      findUserByEmail: jest.fn(),
      updatePassword:  jest.fn(),
    } as unknown as AuthRepository));
  });

  // ── Missing / malformed token ────────────────────────────────────────────

  it('responds 401 when Authorization header is absent', async () => {
    const req        = makeRequest();
    const { res, status, json } = makeResponse();

    await authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: AuthErrorCode.TOKEN_MISSING }),
      }),
    );
  });

  it('responds 401 when Authorization header has no "Bearer " prefix', async () => {
    const req         = makeRequest('Basic dXNlcjpwYXNz');
    const { res, status } = makeResponse();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 when Bearer token is empty ("Bearer ")', async () => {
    const req         = makeRequest('Bearer ');
    const { res, status } = makeResponse();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 for an invalid (garbage) token', async () => {
    const req         = makeRequest('Bearer not.a.real.token');
    const { res, status, json } = makeResponse();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 401 for an expired access token', async () => {
    const jwt = await import('jsonwebtoken');
    const expired = jwt.default.sign(
      {
        sub:            'user-uuid-001',
        organizationId: 'org-uuid-001',
        email:          'u@test.io',
        type:           'access',
      },
      process.env['JWT_ACCESS_SECRET'] as string,
      { expiresIn: -1, algorithm: 'HS256' },
    );

    const req         = makeRequest(`Bearer ${expired}`);
    const { res, status, json } = makeResponse();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: AuthErrorCode.TOKEN_EXPIRED }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  // ── User lookup failures ─────────────────────────────────────────────────

  it('responds 401 when user no longer exists in the database', async () => {
    mockFindUserById.mockResolvedValue(null);

    const token = signAccessToken({
      sub:            'deleted-user',
      organizationId: 'org-uuid-001',
      email:          'deleted@silvapure.io',
      type:           'access',
    });
    const req         = makeRequest(`Bearer ${token}`);
    const { res, status, json } = makeResponse();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 403 when the user account is SUSPENDED', async () => {
    mockFindUserById.mockResolvedValue({ ...makeActiveUser(), status: UserStatus.SUSPENDED });

    const token = signAccessToken({
      sub:            'user-uuid-001',
      organizationId: 'org-uuid-001',
      email:          'user@silvapure.io',
      type:           'access',
    });
    const req         = makeRequest(`Bearer ${token}`);
    const { res, status, json } = makeResponse();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: AuthErrorCode.ACCOUNT_INACTIVE }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('responds 403 when the user account is INACTIVE', async () => {
    mockFindUserById.mockResolvedValue({ ...makeActiveUser(), status: UserStatus.INACTIVE });

    const token = signAccessToken({
      sub:            'user-uuid-001',
      organizationId: 'org-uuid-001',
      email:          'user@silvapure.io',
      type:           'access',
    });
    const req         = makeRequest(`Bearer ${token}`);
    const { res, status, json } = makeResponse();

    await authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  // ── Happy path ───────────────────────────────────────────────────────────

  it('calls next() and attaches req.user for a valid token and active user', async () => {
    const token = signAccessToken({
      sub:            'user-uuid-001',
      organizationId: 'org-uuid-001',
      email:          'user@silvapure.io',
      type:           'access',
    });
    const req     = makeRequest(`Bearer ${token}`);
    const { res } = makeResponse();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(/* no args */);

    const authedReq = req as Request & {
      user: { id: string; email: string; organizationId: string; status: UserStatus };
    };
    expect(authedReq.user.id).toBe('user-uuid-001');
    expect(authedReq.user.email).toBe('user@silvapure.io');
    expect(authedReq.user.organizationId).toBe('org-uuid-001');
    expect(authedReq.user.status).toBe(UserStatus.ACTIVE);
  });

  it('does NOT attach passwordHash to req.user', async () => {
    const token = signAccessToken({
      sub:            'user-uuid-001',
      organizationId: 'org-uuid-001',
      email:          'user@silvapure.io',
      type:           'access',
    });
    const req     = makeRequest(`Bearer ${token}`);
    const { res } = makeResponse();

    await authenticate(req, res, next);

    expect((req as Request & Record<string, unknown>)['user']).not.toHaveProperty('passwordHash');
  });

  it('calls findUserById with the sub from the token', async () => {
    const token = signAccessToken({
      sub:            'user-uuid-001',
      organizationId: 'org-uuid-001',
      email:          'user@silvapure.io',
      type:           'access',
    });
    const req     = makeRequest(`Bearer ${token}`);
    const { res } = makeResponse();

    await authenticate(req, res, next);

    expect(mockFindUserById).toHaveBeenCalledWith('user-uuid-001');
  });

  it('does not call next() for a missing token (responds directly without calling next)', async () => {
    const req     = makeRequest();
    const { res } = makeResponse();

    await authenticate(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it('does not perform DB lookup when token is invalid (returns early after verification failure)', async () => {
    const req     = makeRequest('Bearer garbage.token.here');
    const { res } = makeResponse();

    await authenticate(req, res, next);

    expect(mockFindUserById).not.toHaveBeenCalled();
  });
});
