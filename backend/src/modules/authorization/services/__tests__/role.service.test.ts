/**
 * Unit tests — RoleService
 *
 * IPermissionRepository is fully mocked.
 */

// ── env bootstrap ─────────────────────────────────────────────────────────────
process.env['NODE_ENV']                 = 'test';
process.env['DATABASE_URL']             = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET']        = 'test-access-secret-at-least-32-chars!!';
process.env['JWT_REFRESH_SECRET']       = 'test-refresh-secret-at-least-32-chars!';
process.env['REDIS_URL']                = 'redis://localhost:6379';
process.env['REDIS_PERMISSION_TTL_SEC'] = '300';
process.env['ARGON2_MEMORY_COST']       = '64';
process.env['ARGON2_TIME_COST']         = '1';
process.env['ARGON2_PARALLELISM']       = '1';

import { RoleService } from '../role.service';
import type { IPermissionRepository, Role } from '../../types/authorization.types';
import { RoleCode } from '@prisma/client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USER_ID = 'user-uuid-001';

function makeRole(code: RoleCode, name: string): Role {
  return { id: `role-${code}`, code, name, description: null };
}

function makeRepo(roles: Role[] = []): IPermissionRepository {
  return {
    findPermissionCodesByUserId: jest.fn().mockResolvedValue(new Set<string>()),
    findRolesByUserId:           jest.fn().mockResolvedValue(roles),
  };
}

// ─── getUserRoles ─────────────────────────────────────────────────────────────

describe('RoleService.getUserRoles', () => {
  it('returns all roles for the user', async () => {
    const roles = [makeRole(RoleCode.ADMIN, 'Administrator')];
    const repo  = makeRepo(roles);
    const svc   = new RoleService(repo);

    const result = await svc.getUserRoles(USER_ID);

    expect(result).toHaveLength(1);
    expect(result[0]?.code).toBe(RoleCode.ADMIN);
    expect(repo.findRolesByUserId).toHaveBeenCalledWith(USER_ID);
  });

  it('returns an empty array when user has no roles', async () => {
    const svc = new RoleService(makeRepo([]));
    await expect(svc.getUserRoles(USER_ID)).resolves.toEqual([]);
  });

  it('returns multiple roles for a user with more than one role', async () => {
    const roles = [
      makeRole(RoleCode.OPERATOR, 'Operator'),
      makeRole(RoleCode.VIEWER, 'Viewer'),
    ];
    const svc = new RoleService(makeRepo(roles));
    const result = await svc.getUserRoles(USER_ID);
    expect(result).toHaveLength(2);
  });
});

// ─── hasRole ──────────────────────────────────────────────────────────────────

describe('RoleService.hasRole', () => {
  it('returns true when user holds the queried role', async () => {
    const roles = [makeRole(RoleCode.PLANT_MANAGER, 'Plant Manager')];
    const svc   = new RoleService(makeRepo(roles));

    await expect(svc.hasRole(USER_ID, RoleCode.PLANT_MANAGER)).resolves.toBe(true);
  });

  it('returns false when user does not hold the queried role', async () => {
    const roles = [makeRole(RoleCode.VIEWER, 'Viewer')];
    const svc   = new RoleService(makeRepo(roles));

    await expect(svc.hasRole(USER_ID, RoleCode.ADMIN)).resolves.toBe(false);
  });

  it('returns false when user has no roles at all', async () => {
    const svc = new RoleService(makeRepo([]));
    await expect(svc.hasRole(USER_ID, RoleCode.OPERATOR)).resolves.toBe(false);
  });

  it('checks by role code, not role id', async () => {
    const roles = [makeRole(RoleCode.ENVIRONMENTAL_OFFICER, 'Env Officer')];
    const svc   = new RoleService(makeRepo(roles));

    await expect(svc.hasRole(USER_ID, RoleCode.ENVIRONMENTAL_OFFICER)).resolves.toBe(true);
    await expect(svc.hasRole(USER_ID, RoleCode.PLANT_MANAGER)).resolves.toBe(false);
  });

  it('calls findRolesByUserId with the correct userId', async () => {
    const repo = makeRepo([makeRole(RoleCode.ADMIN, 'Admin')]);
    const svc  = new RoleService(repo);

    await svc.hasRole(USER_ID, RoleCode.ADMIN);

    expect(repo.findRolesByUserId).toHaveBeenCalledWith(USER_ID);
  });
});
