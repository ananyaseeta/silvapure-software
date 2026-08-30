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

jest.mock('argon2', () => ({
  argon2id: 'argon2id',
  hash:     jest.fn().mockResolvedValue('$argon2id$hashed'),
  verify:   jest.fn().mockResolvedValue(true),
}));
jest.mock('../repository');
jest.mock('../../organization/scope.service');
jest.mock('../../../config/prisma', () => ({ prisma: {} }));

import { UserService }    from '../service';
import { UserRepository } from '../repository';
import { OrgScopeService } from '../../organization/scope.service';
import { UserError, UserErrorCode } from '../types';
import type { UserRecord } from '../types';
import { UserStatus, RoleCode } from '@prisma/client';
import { AuthorizationErrorCode } from '../../authorization/types/authorization.types';
import type { AuthUser } from '../../auth/types/auth.types';
import argon2 from 'argon2';

const MockedRepo      = UserRepository  as jest.MockedClass<typeof UserRepository>;
const MockedScopeSvc  = OrgScopeService as jest.MockedClass<typeof OrgScopeService>;
const mockArgon2Hash  = argon2.hash     as jest.MockedFunction<typeof argon2.hash>;

beforeEach(() => {
  mockArgon2Hash.mockResolvedValue('$argon2id$hashed' as never);
});

// ─── UUID fixtures ─────────────────────────────────────────────────────────────
const ORG_A        = 'a1b2c3d4-e5f6-4789-a012-b34c56d78e90';
const ORG_B        = 'b2c3d4e5-f6a7-4890-b123-c45d67e89f01';
const USER_IN_A    = 'c3d4e5f6-a7b8-4901-c234-d56e78f90a12';
const USER_IN_B    = 'd4e5f6a7-b8c9-4012-d345-e67f89a01b23';
const ADMIN_ID     = 'e5f6a7b8-c9d0-4123-e456-f78a90b12c34';
const REQUESTER_ID = 'f6a7b8c9-d0e1-4234-f567-089b01c23d45';

function makeUser(id: string, orgId: string): UserRecord {
  return {
    id, organizationId: orgId,
    firstName: 'Jane', lastName: 'Doe',
    email: `${id.slice(0,4)}@test.io`, phone: null, jobTitle: null,
    status: UserStatus.ACTIVE,
    roles: [{ roleId: 'r1', roleCode: RoleCode.VIEWER, roleName: 'Viewer' }],
    createdAt: new Date(), updatedAt: new Date(),
  };
}

function makeRequester(id: string, orgId: string): AuthUser {
  return { id, email: `${id.slice(0,4)}@test.io`, organizationId: orgId, status: UserStatus.ACTIVE };
}

function makeScopeSvc(isAdmin: boolean, canAccess: boolean) {
  MockedScopeSvc.mockClear();
  MockedScopeSvc.mockImplementation(() => ({
    isAdmin:   jest.fn().mockResolvedValue(isAdmin),
    canAccess: jest.fn().mockResolvedValue(canAccess),
  } as unknown as OrgScopeService));
  return new MockedScopeSvc() as jest.Mocked<OrgScopeService>;
}

function makeRepo(targetUser: UserRecord) {
  MockedRepo.mockClear();
  MockedRepo.mockImplementation(() => ({
    findById:           jest.fn().mockResolvedValue(targetUser),
    findByEmail:        jest.fn().mockResolvedValue(null),
    findAll:            jest.fn().mockResolvedValue({ data: [targetUser], total: 1, page: 1, limit: 20, totalPages: 1 }),
    create:             jest.fn().mockResolvedValue(targetUser),
    update:             jest.fn().mockResolvedValue(targetUser),
    updateStatus:       jest.fn().mockResolvedValue(targetUser),
    replaceRoles:       jest.fn().mockResolvedValue(targetUser),
    delete:             jest.fn().mockResolvedValue(undefined),
    findRoleIdsByCode:  jest.fn().mockImplementation((codes: RoleCode[]) =>
      Promise.resolve(codes.map((code, i) => ({ id: `role-${i}`, code }))),
    ),
    organizationExists: jest.fn().mockResolvedValue(true),
  } as unknown as UserRepository));
  return new MockedRepo({} as never) as jest.Mocked<UserRepository>;
}

// ─── list — org scoping ──────────────────────────────────────────────────────

describe('UserService.list — organization scoping', () => {
  it('returns all users for ADMIN (no scope applied)', async () => {
    const scopeSvc = makeScopeSvc(true, true);
    const repo     = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc      = new UserService(repo, scopeSvc);
    const requester = makeRequester(ADMIN_ID, ORG_A);

    await svc.list({ page: 1, limit: 20 }, {}, requester);

    // Admin: repo.findAll called WITHOUT org filter override
    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, {});
  });

  it('scopes list to own org for non-admin user', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await svc.list({ page: 1, limit: 20 }, {}, requester);

    // Non-admin: repo.findAll called WITH organizationId override
    expect(repo.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 20 },
      expect.objectContaining({ organizationId: ORG_A }),
    );
  });

  it('overrides a client-supplied organizationId for non-admin users', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    // Even if a non-admin passes ORG_B in the query, they get scoped to ORG_A
    await svc.list({ page: 1, limit: 20 }, { organizationId: ORG_B }, requester);

    expect(repo.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 20 },
      expect.objectContaining({ organizationId: ORG_A }),
    );
  });

  it('returns unscoped results when no requester is provided (internal use)', async () => {
    const scopeSvc = makeScopeSvc(false, true);
    const repo     = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc      = new UserService(repo, scopeSvc);

    await svc.list({ page: 1, limit: 20 });

    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, undefined);
    expect(scopeSvc.isAdmin).not.toHaveBeenCalled();
  });
});

// ─── getById — org scoping ───────────────────────────────────────────────────

describe('UserService.getById — organization scoping', () => {
  it('returns a user when requester belongs to the same org', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    const user = await svc.getById(USER_IN_A, requester);
    expect(user.id).toBe(USER_IN_A);
  });

  it('throws FORBIDDEN when non-admin accesses a user in a different org', async () => {
    const scopeSvc  = makeScopeSvc(false, false); // canAccess = false
    const repo      = makeRepo(makeUser(USER_IN_B, ORG_B));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await expect(svc.getById(USER_IN_B, requester)).rejects.toThrow(
      expect.objectContaining({ code: AuthorizationErrorCode.FORBIDDEN }),
    );
  });

  it('allows ADMIN to access a user in a different org', async () => {
    const scopeSvc  = makeScopeSvc(true, true); // admin => canAccess = true
    const repo      = makeRepo(makeUser(USER_IN_B, ORG_B));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(ADMIN_ID, ORG_A);

    const user = await svc.getById(USER_IN_B, requester);
    expect(user.id).toBe(USER_IN_B);
  });

  it('still throws NOT_FOUND for a nonexistent user even with valid scope', async () => {
    const scopeSvc = makeScopeSvc(false, true);
    const repo     = makeRepo(makeUser(USER_IN_A, ORG_A));
    repo.findById.mockResolvedValue(null);
    const svc      = new UserService(repo, scopeSvc);

    await expect(svc.getById('missing', makeRequester(REQUESTER_ID, ORG_A))).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.NOT_FOUND }),
    );
  });

  it('allows user to read their own profile without scope check (getMe path)', async () => {
    const scopeSvc = makeScopeSvc(false, true);
    const repo     = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc      = new UserService(repo, scopeSvc);

    // No requester passed = no scope check (getMe controller calls without requester)
    const user = await svc.getById(USER_IN_A);
    expect(user.id).toBe(USER_IN_A);
    expect(scopeSvc.canAccess).not.toHaveBeenCalled();
  });
});

// ─── create — org scoping ─────────────────────────────────────────────────────

describe('UserService.create — organization scoping', () => {
  const dto = {
    organizationId: ORG_A,
    firstName: 'New', email: 'new@test.io', password: 'P@ssw0rd1!',
  };

  it('creates user when requester belongs to the target organization', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    const user = await svc.create(dto, requester);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(user).toBeDefined();
  });

  it('throws FORBIDDEN when non-admin creates a user in a different org', async () => {
    const scopeSvc  = makeScopeSvc(false, false); // canAccess = false
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await expect(svc.create({ ...dto, organizationId: ORG_B }, requester)).rejects.toThrow(
      expect.objectContaining({ code: AuthorizationErrorCode.FORBIDDEN }),
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('allows ADMIN to create a user in any organization', async () => {
    const scopeSvc  = makeScopeSvc(true, true);
    const repo      = makeRepo(makeUser(USER_IN_B, ORG_B));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(ADMIN_ID, ORG_A);

    const user = await svc.create({ ...dto, organizationId: ORG_B }, requester);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(user).toBeDefined();
  });

  it('checks org scope before checking duplicate email (fail-fast order)', async () => {
    const scopeSvc  = makeScopeSvc(false, false);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await expect(svc.create({ ...dto, organizationId: ORG_B }, requester)).rejects.toThrow(
      expect.objectContaining({ code: AuthorizationErrorCode.FORBIDDEN }),
    );
    // findByEmail should NOT be called when org check fails first
    expect(repo.findByEmail).not.toHaveBeenCalled();
  });
});

// ─── update — org scoping ─────────────────────────────────────────────────────

describe('UserService.update — organization scoping', () => {
  it('updates user when requester belongs to same org', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await svc.update(USER_IN_A, { firstName: 'Updated' }, requester);
    expect(repo.update).toHaveBeenCalledWith(USER_IN_A, { firstName: 'Updated' });
  });

  it('throws FORBIDDEN when updating a user in a different org', async () => {
    const scopeSvc  = makeScopeSvc(false, false);
    const repo      = makeRepo(makeUser(USER_IN_B, ORG_B));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await expect(svc.update(USER_IN_B, { firstName: 'x' }, requester)).rejects.toThrow(
      expect.objectContaining({ code: AuthorizationErrorCode.FORBIDDEN }),
    );
    expect(repo.update).not.toHaveBeenCalled();
  });
});

// ─── delete — org scoping ─────────────────────────────────────────────────────

describe('UserService.delete — organization scoping', () => {
  it('deletes user when requester belongs to same org', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await svc.delete(USER_IN_A, REQUESTER_ID, requester);
    expect(repo.delete).toHaveBeenCalledWith(USER_IN_A);
  });

  it('throws FORBIDDEN when deleting a user from a different org', async () => {
    const scopeSvc  = makeScopeSvc(false, false);
    const repo      = makeRepo(makeUser(USER_IN_B, ORG_B));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await expect(svc.delete(USER_IN_B, REQUESTER_ID, requester)).rejects.toThrow(
      expect.objectContaining({ code: AuthorizationErrorCode.FORBIDDEN }),
    );
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('throws CANNOT_DELETE_SELF regardless of org scope', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(USER_IN_A, ORG_A); // same user

    await expect(svc.delete(USER_IN_A, USER_IN_A, requester)).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.CANNOT_DELETE_SELF }),
    );
  });
});

// ─── assignRoles — self-escalation prevention ─────────────────────────────────

describe('UserService.assignRoles — self-escalation prevention', () => {
  it('throws CANNOT_DELETE_SELF when user assigns roles to themselves', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(USER_IN_A, ORG_A);

    await expect(
      svc.assignRoles(USER_IN_A, { roles: [RoleCode.ADMIN] }, USER_IN_A, requester),
    ).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.CANNOT_DELETE_SELF }),
    );
    expect(repo.replaceRoles).not.toHaveBeenCalled();
  });

  it('allows assigning roles to other users in same org', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await svc.assignRoles(USER_IN_A, { roles: [RoleCode.VIEWER] }, REQUESTER_ID, requester);
    expect(repo.replaceRoles).toHaveBeenCalledTimes(1);
  });

  it('throws FORBIDDEN when assigning roles to a user in a different org', async () => {
    const scopeSvc  = makeScopeSvc(false, false);
    const repo      = makeRepo(makeUser(USER_IN_B, ORG_B));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    await expect(
      svc.assignRoles(USER_IN_B, { roles: [RoleCode.VIEWER] }, REQUESTER_ID, requester),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthorizationErrorCode.FORBIDDEN }),
    );
  });
});

// ─── passwordHash never returned ──────────────────────────────────────────────

describe('UserService — password security', () => {
  it('returned UserRecord never contains passwordHash', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);

    const user = await svc.getById(USER_IN_A);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('create() never returns passwordHash', async () => {
    const scopeSvc  = makeScopeSvc(false, true);
    const repo      = makeRepo(makeUser(USER_IN_A, ORG_A));
    const svc       = new UserService(repo, scopeSvc);
    const requester = makeRequester(REQUESTER_ID, ORG_A);

    const user = await svc.create(
      { organizationId: ORG_A, firstName: 'J', email: 'j@test.io', password: 'P@ssw0rd1!' },
      requester,
    );
    expect(user).not.toHaveProperty('passwordHash');
  });
});
