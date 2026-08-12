/**
 * Unit tests — UserService
 *
 * UserRepository and Argon2 are mocked. No DB or crypto work.
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

jest.mock('argon2', () => ({
  argon2id: 'argon2id',
  hash:     jest.fn().mockResolvedValue('$argon2id$hashed'),
  verify:   jest.fn().mockResolvedValue(true),
}));

jest.mock('../repository');

import { UserService }    from '../service';
import { UserRepository } from '../repository';
import { UserError, UserErrorCode } from '../types';
import type { UserRecord, UserSummary, UserPaginatedResult } from '../types';
import { UserStatus, RoleCode } from '@prisma/client';
import argon2 from 'argon2';

const MockedRepo     = UserRepository as jest.MockedClass<typeof UserRepository>;
const mockArgon2Hash = argon2.hash as jest.MockedFunction<typeof argon2.hash>;

// Restore argon2 mock before each test — jest.resetMocks clears it between tests
beforeEach(() => {
  mockArgon2Hash.mockResolvedValue('$argon2id$hashed' as never);
});

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const ORG_ID  = 'a1b2c3d4-e5f6-4789-a012-b34c56d78e90';
const USER_ID = 'b2c3d4e5-f6a7-4890-b123-c45d67e89f01';
const REQ_ID  = 'c3d4e5f6-a7b8-4901-c234-d56e78f90a12';

function makeUserRecord(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    id:             USER_ID,
    organizationId: ORG_ID,
    firstName:      'Jane',
    lastName:       'Doe',
    email:          'jane@silvapure.io',
    phone:          null,
    jobTitle:       'Plant Manager',
    status:         UserStatus.ACTIVE,
    roles:          [{ roleId: 'role-id-1', roleCode: RoleCode.PLANT_MANAGER, roleName: 'Plant Manager' }],
    createdAt:      new Date('2024-01-01'),
    updatedAt:      new Date('2024-01-01'),
    ...overrides,
  };
}

function makeRepo(): jest.Mocked<UserRepository> {
  MockedRepo.mockClear();
  MockedRepo.mockImplementation(() => ({
    findById:            jest.fn().mockResolvedValue(makeUserRecord()),
    findByEmail:         jest.fn().mockResolvedValue(null),
    findAll:             jest.fn().mockResolvedValue({ data: [makeUserRecord()], total: 1, page: 1, limit: 20, totalPages: 1 }),
    create:              jest.fn().mockResolvedValue(makeUserRecord()),
    update:              jest.fn().mockResolvedValue(makeUserRecord()),
    updateStatus:        jest.fn().mockResolvedValue(makeUserRecord()),
    replaceRoles:        jest.fn().mockResolvedValue(makeUserRecord()),
    delete:              jest.fn().mockResolvedValue(undefined),
    findRoleIdsByCode:   jest.fn().mockResolvedValue([{ id: 'role-id-1', code: RoleCode.PLANT_MANAGER }]),
    organizationExists:  jest.fn().mockResolvedValue(true),
  } as unknown as UserRepository));
  return new MockedRepo({} as never) as jest.Mocked<UserRepository>;
}

// ─── list ─────────────────────────────────────────────────────────────────────

describe('UserService.list', () => {
  it('returns paginated results', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    const result = await svc.list({ page: 1, limit: 20 });
    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
    // service passes undefined filters when none provided — repo handles it
    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, undefined);
  });

  it('passes filters to the repository', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await svc.list({ page: 1, limit: 10 }, { organizationId: ORG_ID, status: UserStatus.ACTIVE });
    expect(repo.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      { organizationId: ORG_ID, status: UserStatus.ACTIVE },
    );
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('UserService.getById', () => {
  it('returns user when found', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    const user = await svc.getById(USER_ID);
    expect(user.id).toBe(USER_ID);
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('throws NOT_FOUND(404) when user does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new UserService(repo);
    await expect(svc.getById('missing')).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.NOT_FOUND, statusHint: 404 }),
    );
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('UserService.create', () => {
  const dto = {
    organizationId: ORG_ID,
    firstName:      'Jane',
    email:          'jane@silvapure.io',
    password:       'P@ssw0rd!',
  };

  it('creates and returns a user', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    const user = await svc.create(dto);
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(user.email).toBe('jane@silvapure.io');
  });

  it('hashes the password before passing to repo', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await svc.create(dto);
    // argon2.hash must be called with the plain-text password
    expect(mockArgon2Hash).toHaveBeenCalledWith('P@ssw0rd!', expect.any(Object));
    // repo.create must be called with the hashed password, not the plain one
    const createArg = (repo.create as jest.Mock).mock.calls[0]?.[0] as { passwordHash: string } | undefined;
    expect(createArg?.passwordHash).toBe('$argon2id$hashed');
  });

  it('throws EMAIL_TAKEN(409) when email already exists', async () => {
    const repo = makeRepo();
    repo.findByEmail.mockResolvedValue(makeUserRecord());
    const svc = new UserService(repo);
    await expect(svc.create(dto)).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.EMAIL_TAKEN, statusHint: 409 }),
    );
  });

  it('does not call repo.create when email is taken', async () => {
    const repo = makeRepo();
    repo.findByEmail.mockResolvedValue(makeUserRecord());
    const svc = new UserService(repo);
    await expect(svc.create(dto)).rejects.toThrow(UserError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('throws ORG_NOT_FOUND(422) when organization does not exist', async () => {
    const repo = makeRepo();
    repo.organizationExists.mockResolvedValue(false);
    const svc = new UserService(repo);
    await expect(svc.create(dto)).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.ORG_NOT_FOUND, statusHint: 422 }),
    );
  });

  it('throws ROLE_NOT_FOUND(422) when a role code is invalid', async () => {
    const repo = makeRepo();
    repo.findRoleIdsByCode.mockResolvedValue([]); // no roles found
    const svc = new UserService(repo);
    await expect(
      svc.create({ ...dto, roles: [RoleCode.ADMIN] }),
    ).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.ROLE_NOT_FOUND, statusHint: 422 }),
    );
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('UserService.update', () => {
  it('updates and returns user', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await svc.update(USER_ID, { firstName: 'Janet' });
    expect(repo.update).toHaveBeenCalledWith(USER_ID, { firstName: 'Janet' });
  });

  it('throws NOT_FOUND when user does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new UserService(repo);
    await expect(svc.update(USER_ID, { firstName: 'x' })).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.NOT_FOUND }),
    );
  });
});

// ─── updateStatus ────────────────────────────────────────────────────────────

describe('UserService.updateStatus', () => {
  it('updates status successfully', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await svc.updateStatus(USER_ID, { status: UserStatus.INACTIVE }, REQ_ID);
    expect(repo.updateStatus).toHaveBeenCalledWith(USER_ID, UserStatus.INACTIVE);
  });

  it('throws CANNOT_DELETE_SELF(422) when user tries to change their own status', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await expect(
      svc.updateStatus(USER_ID, { status: UserStatus.INACTIVE }, USER_ID),
    ).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.CANNOT_DELETE_SELF, statusHint: 422 }),
    );
  });
});

// ─── assignRoles ─────────────────────────────────────────────────────────────

describe('UserService.assignRoles', () => {
  it('replaces user roles and returns updated user', async () => {
    const repo = makeRepo();
    // Override findRoleIdsByCode to return the requested code dynamically
    repo.findRoleIdsByCode.mockImplementation((codes) =>
      Promise.resolve(codes.map((code, i) => ({ id: `role-id-${i}`, code }))),
    );
    const svc  = new UserService(repo);
    await svc.assignRoles(USER_ID, { roles: [RoleCode.VIEWER] });
    expect(repo.replaceRoles).toHaveBeenCalledWith(USER_ID, ['role-id-0']);
  });

  it('throws ROLE_NOT_FOUND when code does not exist in DB', async () => {
    const repo = makeRepo();
    repo.findRoleIdsByCode.mockResolvedValue([]);
    const svc = new UserService(repo);
    await expect(
      svc.assignRoles(USER_ID, { roles: [RoleCode.ADMIN] }),
    ).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.ROLE_NOT_FOUND }),
    );
  });

  it('does not call replaceRoles when role lookup fails', async () => {
    const repo = makeRepo();
    repo.findRoleIdsByCode.mockResolvedValue([]);
    const svc = new UserService(repo);
    await expect(svc.assignRoles(USER_ID, { roles: [RoleCode.ADMIN] })).rejects.toThrow(UserError);
    expect(repo.replaceRoles).not.toHaveBeenCalled();
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('UserService.delete', () => {
  it('deletes user successfully', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await expect(svc.delete(USER_ID, REQ_ID)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(USER_ID);
  });

  it('throws CANNOT_DELETE_SELF(422) when user deletes themselves', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await expect(svc.delete(USER_ID, USER_ID)).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.CANNOT_DELETE_SELF, statusHint: 422 }),
    );
  });

  it('does not call repo.delete when self-delete is attempted', async () => {
    const repo = makeRepo();
    const svc  = new UserService(repo);
    await expect(svc.delete(USER_ID, USER_ID)).rejects.toThrow(UserError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when user does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new UserService(repo);
    await expect(svc.delete(USER_ID, REQ_ID)).rejects.toThrow(
      expect.objectContaining({ code: UserErrorCode.NOT_FOUND }),
    );
  });
});

// ─── UserError ────────────────────────────────────────────────────────────────

describe('UserError', () => {
  it('is an instance of Error', () => {
    const err = new UserError(UserErrorCode.NOT_FOUND, 'not found');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('UserError');
  });

  it('defaults statusHint to 400', () => {
    const err = new UserError(UserErrorCode.EMAIL_TAKEN, 'taken');
    expect(err.statusHint).toBe(400);
  });

  it('accepts a custom statusHint', () => {
    const err = new UserError(UserErrorCode.NOT_FOUND, 'nf', 404);
    expect(err.statusHint).toBe(404);
    expect(err.code).toBe(UserErrorCode.NOT_FOUND);
  });
});
