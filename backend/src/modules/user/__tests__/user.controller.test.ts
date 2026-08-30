/**
 * Unit tests — User Controller
 *
 * UserService is mocked. Tests verify HTTP response shaping,
 * Zod validation, and error propagation.
 *
 * All ID fixtures use real UUID v4 strings (Zod v4 validates format strictly).
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

jest.mock('../../../config/prisma', () => ({ prisma: {} }));
jest.mock('../repository');
jest.mock('../service');
jest.mock('../../organization/scope.service', () => ({
  orgScopeService: {
    isAdmin:   jest.fn().mockResolvedValue(false),
    canAccess: jest.fn().mockResolvedValue(true),
  },
}));
jest.mock('../../audit/audit.service', () => ({
  auditService: { record: jest.fn() },
  AuditAction: {
    USER_CREATED:        'USER_CREATED',
    USER_UPDATED:        'USER_UPDATED',
    USER_DELETED:        'USER_DELETED',
    USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
    USER_ROLES_CHANGED:  'USER_ROLES_CHANGED',
  },
  AuditResource: { USER: 'User' },
}));

import type { Request, Response, NextFunction } from 'express';
import { UserStatus, RoleCode } from '@prisma/client';
import {
  listUsers, getUser, getMe, createUser,
  updateUser, updateUserStatus, assignUserRoles, deleteUser,
} from '../controller';
import { UserService }  from '../service';
import { auditService } from '../../audit/audit.service';
import { UserError, UserErrorCode } from '../types';
import type { UserRecord } from '../types';

const MockedService = UserService as jest.MockedClass<typeof UserService>;
const mockAuditRecord = auditService.record as jest.Mock;

beforeEach(() => {
  mockAuditRecord.mockResolvedValue(undefined);
});

// ─── UUID fixtures ─────────────────────────────────────────────────────────────
const USER_ID = 'b2c3d4e5-f6a7-4890-b123-c45d67e89f01';
const ORG_ID  = 'a1b2c3d4-e5f6-4789-a012-b34c56d78e90';
const REQ_UID = 'c3d4e5f6-a7b8-4901-c234-d56e78f90a12';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

function makeUserRecord(): UserRecord {
  return {
    id:             USER_ID,
    organizationId: ORG_ID,
    firstName:      'Jane',
    lastName:       'Doe',
    email:          'jane@silvapure.io',
    phone:          null,
    jobTitle:       null,
    status:         UserStatus.ACTIVE,
    roles:          [{ roleId: 'r1', roleCode: RoleCode.VIEWER, roleName: 'Viewer' }],
    createdAt:      new Date('2024-01-01'),
    updatedAt:      new Date('2024-01-01'),
  };
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body:   {},
    params: {},
    query:  {},
    user:   { id: REQ_UID, email: 'req@silvapure.io', organizationId: ORG_ID, status: UserStatus.ACTIVE },
    ...overrides,
  } as unknown as Request;
}

function makeRes(): { res: Response; json: jest.Mock; status: jest.Mock; send: jest.Mock } {
  const json   = jest.fn().mockReturnThis();
  const send   = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json, send });
  return { res: { status, json, send } as unknown as Response, json, status, send };
}

function buildMock(overrides: Partial<{
  list: jest.Mock; getById: jest.Mock; create: jest.Mock; update: jest.Mock;
  updateStatus: jest.Mock; assignRoles: jest.Mock; delete: jest.Mock;
}> = {}) {
  const base = {
    list:         jest.fn().mockResolvedValue({ data: [makeUserRecord()], total: 1, page: 1, limit: 20, totalPages: 1 }),
    getById:      jest.fn().mockResolvedValue(makeUserRecord()),
    create:       jest.fn().mockResolvedValue(makeUserRecord()),
    update:       jest.fn().mockResolvedValue(makeUserRecord()),
    updateStatus: jest.fn().mockResolvedValue(makeUserRecord()),
    assignRoles:  jest.fn().mockResolvedValue(makeUserRecord()),
    delete:       jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  MockedService.mockImplementation(() => base as unknown as UserService);
  return base;
}

// ─── listUsers ────────────────────────────────────────────────────────────────

describe('listUsers', () => {
  it('responds 200 with paginated result', async () => {
    buildMock();
    const { res, status } = makeRes();
    await listUsers(makeReq({ query: {} }), res, jest.fn());
    expect(status).toHaveBeenCalledWith(200);
  });

  it('calls next(err) on service failure', async () => {
    const m = buildMock();
    m.list.mockRejectedValue(new Error('fail'));
    const next = jest.fn();
    await listUsers(makeReq({ query: {} }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── getUser ──────────────────────────────────────────────────────────────────

describe('getUser', () => {
  it('responds 200 with user data', async () => {
    buildMock();
    const { res, status, json } = makeRes();
    await getUser(makeReq({ params: { id: USER_ID } as never }), res, jest.fn());
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: makeUserRecord() });
  });

  it('calls next(ZodError) for invalid UUID', async () => {
    buildMock();
    const next = jest.fn();
    await getUser(makeReq({ params: { id: 'bad' } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('propagates NOT_FOUND error to next', async () => {
    const m = buildMock();
    m.getById.mockRejectedValue(new UserError(UserErrorCode.NOT_FOUND, 'nf', 404));
    const next = jest.fn();
    await getUser(makeReq({ params: { id: USER_ID } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: UserErrorCode.NOT_FOUND }));
  });
});

// ─── getMe ────────────────────────────────────────────────────────────────────

describe('getMe', () => {
  it('responds 200 with the authenticated user profile', async () => {
    buildMock();
    const { res, status } = makeRes();
    await getMe(makeReq(), res, jest.fn());
    expect(status).toHaveBeenCalledWith(200);
  });
});

// ─── createUser ───────────────────────────────────────────────────────────────

describe('createUser', () => {
  const validBody = {
    organizationId: ORG_ID,
    firstName:      'Jane',
    email:          'jane@silvapure.io',
    password:       'P@ssw0rd1!',
  };

  it('responds 201 with created user', async () => {
    buildMock();
    const { res, status } = makeRes();
    await createUser(makeReq({ body: validBody }), res, jest.fn());
    expect(status).toHaveBeenCalledWith(201);
  });

  it('calls next(ZodError) for missing required fields', async () => {
    buildMock();
    const next = jest.fn();
    await createUser(makeReq({ body: { email: 'x@y.com' } }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('calls next(ZodError) for weak password', async () => {
    buildMock();
    const next = jest.fn();
    await createUser(makeReq({ body: { ...validBody, password: 'weak' } }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('propagates EMAIL_TAKEN error', async () => {
    const m = buildMock();
    m.create.mockRejectedValue(new UserError(UserErrorCode.EMAIL_TAKEN, 'taken', 409));
    const next = jest.fn();
    await createUser(makeReq({ body: validBody }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ code: UserErrorCode.EMAIL_TAKEN }));
  });
});

// ─── updateUser ───────────────────────────────────────────────────────────────

describe('updateUser', () => {
  it('responds 200 on successful update', async () => {
    buildMock();
    const { res, status } = makeRes();
    await updateUser(
      makeReq({ params: { id: USER_ID } as never, body: { firstName: 'Janet' } }),
      res,
      jest.fn(),
    );
    expect(status).toHaveBeenCalledWith(200);
  });

  it('calls next(ZodError) when body is empty', async () => {
    buildMock();
    const next = jest.fn();
    await updateUser(makeReq({ params: { id: USER_ID } as never, body: {} }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── updateUserStatus ────────────────────────────────────────────────────────

describe('updateUserStatus', () => {
  it('responds 200 when status is valid', async () => {
    buildMock();
    const { res, status } = makeRes();
    await updateUserStatus(
      makeReq({ params: { id: USER_ID } as never, body: { status: UserStatus.INACTIVE } }),
      res,
      jest.fn(),
    );
    expect(status).toHaveBeenCalledWith(200);
  });

  it('calls next(ZodError) for invalid status value', async () => {
    buildMock();
    const next = jest.fn();
    await updateUserStatus(
      makeReq({ params: { id: USER_ID } as never, body: { status: 'INVALID' } }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('propagates CANNOT_DELETE_SELF error', async () => {
    const m = buildMock();
    m.updateStatus.mockRejectedValue(
      new UserError(UserErrorCode.CANNOT_DELETE_SELF, 'self', 422),
    );
    const next = jest.fn();
    await updateUserStatus(
      makeReq({ params: { id: USER_ID } as never, body: { status: UserStatus.INACTIVE } }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: UserErrorCode.CANNOT_DELETE_SELF }),
    );
  });
});

// ─── assignUserRoles ─────────────────────────────────────────────────────────

describe('assignUserRoles', () => {
  it('responds 200 with updated user', async () => {
    buildMock();
    const { res, status } = makeRes();
    await assignUserRoles(
      makeReq({ params: { id: USER_ID } as never, body: { roles: [RoleCode.VIEWER] } }),
      res,
      jest.fn(),
    );
    expect(status).toHaveBeenCalledWith(200);
  });

  it('calls next(ZodError) when roles array is empty', async () => {
    buildMock();
    const next = jest.fn();
    await assignUserRoles(
      makeReq({ params: { id: USER_ID } as never, body: { roles: [] } }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── deleteUser ──────────────────────────────────────────────────────────────

describe('deleteUser', () => {
  it('responds 204 on successful delete', async () => {
    buildMock();
    const { res, status, send } = makeRes();
    await deleteUser(makeReq({ params: { id: USER_ID } as never }), res, jest.fn());
    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('calls next(ZodError) for invalid UUID', async () => {
    buildMock();
    const next = jest.fn();
    await deleteUser(makeReq({ params: { id: 'bad' } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('propagates CANNOT_DELETE_SELF error', async () => {
    const m = buildMock();
    m.delete.mockRejectedValue(new UserError(UserErrorCode.CANNOT_DELETE_SELF, 'self', 422));
    const next = jest.fn();
    await deleteUser(makeReq({ params: { id: USER_ID } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: UserErrorCode.CANNOT_DELETE_SELF }),
    );
  });

  it('propagates NOT_FOUND error', async () => {
    const m = buildMock();
    m.delete.mockRejectedValue(new UserError(UserErrorCode.NOT_FOUND, 'nf', 404));
    const next = jest.fn();
    await deleteUser(makeReq({ params: { id: USER_ID } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: UserErrorCode.NOT_FOUND }),
    );
  });
});
