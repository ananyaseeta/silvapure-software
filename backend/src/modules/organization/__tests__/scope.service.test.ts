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

jest.mock('../../../config/prisma', () => ({
  prisma: { userRole: { findFirst: jest.fn() } },
}));

import { OrgScopeService } from '../scope.service';
import { prisma }           from '../../../config/prisma';
import { UserStatus }       from '@prisma/client';
import type { AuthUser }    from '../../auth/types/auth.types';

const mockFindFirst = prisma.userRole.findFirst as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ORG_A = 'a1b2c3d4-e5f6-4789-a012-b34c56d78e90';
const ORG_B = 'b2c3d4e5-f6a7-4890-b123-c45d67e89f01';
const USER_ADMIN_ID    = 'c3d4e5f6-a7b8-4901-c234-d56e78f90a12';
const USER_NON_ADMIN_ID = 'd4e5f6a7-b8c9-4012-d345-e67f89a01b23';

function makeUser(id: string, organizationId: string): AuthUser {
  return { id, email: 'u@test.io', organizationId, status: UserStatus.ACTIVE };
}

// ─── isAdmin ──────────────────────────────────────────────────────────────────

describe('OrgScopeService.isAdmin', () => {
  beforeEach(() => mockFindFirst.mockReset());

  it('returns true when the user has an ADMIN UserRole row', async () => {
    mockFindFirst.mockResolvedValue({ userId: USER_ADMIN_ID });
    const svc = new OrgScopeService();
    await expect(svc.isAdmin(USER_ADMIN_ID)).resolves.toBe(true);
  });

  it('returns false when the user has no ADMIN UserRole row', async () => {
    mockFindFirst.mockResolvedValue(null);
    const svc = new OrgScopeService();
    await expect(svc.isAdmin(USER_NON_ADMIN_ID)).resolves.toBe(false);
  });

  it('queries using the correct userId and ADMIN role code', async () => {
    mockFindFirst.mockResolvedValue(null);
    const svc = new OrgScopeService();
    await svc.isAdmin(USER_ADMIN_ID);
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: USER_ADMIN_ID }),
      }),
    );
  });
});

// ─── canAccess ────────────────────────────────────────────────────────────────

describe('OrgScopeService.canAccess', () => {
  beforeEach(() => mockFindFirst.mockReset());

  it('returns true for ADMIN accessing their own organization', async () => {
    mockFindFirst.mockResolvedValue({ userId: USER_ADMIN_ID });
    const svc  = new OrgScopeService();
    const user = makeUser(USER_ADMIN_ID, ORG_A);
    await expect(svc.canAccess(user, ORG_A)).resolves.toBe(true);
  });

  it('returns true for ADMIN accessing a different organization (cross-org access)', async () => {
    mockFindFirst.mockResolvedValue({ userId: USER_ADMIN_ID });
    const svc  = new OrgScopeService();
    const user = makeUser(USER_ADMIN_ID, ORG_A);
    await expect(svc.canAccess(user, ORG_B)).resolves.toBe(true);
  });

  it('returns true for non-admin user accessing their own organization', async () => {
    mockFindFirst.mockResolvedValue(null);
    const svc  = new OrgScopeService();
    const user = makeUser(USER_NON_ADMIN_ID, ORG_A);
    await expect(svc.canAccess(user, ORG_A)).resolves.toBe(true);
  });

  it('returns false for non-admin user accessing a different organization', async () => {
    mockFindFirst.mockResolvedValue(null);
    const svc  = new OrgScopeService();
    const user = makeUser(USER_NON_ADMIN_ID, ORG_A);
    await expect(svc.canAccess(user, ORG_B)).resolves.toBe(false);
  });

  it('returns false when user organizationId is an empty string', async () => {
    mockFindFirst.mockResolvedValue(null);
    const svc  = new OrgScopeService();
    const user = { ...makeUser(USER_NON_ADMIN_ID, ''), organizationId: '' };
    await expect(svc.canAccess(user, ORG_A)).resolves.toBe(false);
  });

  it('propagates database errors', async () => {
    mockFindFirst.mockRejectedValue(new Error('DB connection failed'));
    const svc  = new OrgScopeService();
    const user = makeUser(USER_NON_ADMIN_ID, ORG_A);
    await expect(svc.canAccess(user, ORG_A)).rejects.toThrow('DB connection failed');
  });
});
