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
jest.mock('../scope.service');

import { OrganizationService }   from '../service';
import { OrganizationRepository } from '../repository';
import { OrgScopeService }        from '../scope.service';
import { OrganizationStatus }     from '@prisma/client';
import type { OrganizationRecord, IndustryTypeRecord } from '../types';

const MockedRepo      = OrganizationRepository  as jest.MockedClass<typeof OrganizationRepository>;
const MockedScopeSvc  = OrgScopeService          as jest.MockedClass<typeof OrgScopeService>;

// ─── UUID fixtures ─────────────────────────────────────────────────────────────
const ORG_A         = 'a1b2c3d4-e5f6-4789-a012-b34c56d78e90';
const ORG_B         = 'b2c3d4e5-f6a7-4890-b123-c45d67e89f01';
const ADMIN_ID      = 'c3d4e5f6-a7b8-4901-c234-d56e78f90a12';
const NON_ADMIN_ID  = 'd4e5f6a7-b8c9-4012-d345-e67f89a01b23';
const INDUSTRY_ID   = 'f1e2d3c4-b5a6-4789-8012-c34d56e78f90';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const INDUSTRY: IndustryTypeRecord = { id: INDUSTRY_ID, name: 'Municipal', description: null };

function makeOrg(id = ORG_A): OrganizationRecord {
  return {
    id, organizationCode: `CODE-${id.slice(0,4)}`,
    legalName: 'Test Ltd', displayName: 'Test',
    email: null, phone: null, website: null,
    status: OrganizationStatus.ACTIVE,
    industryTypeId: INDUSTRY_ID, industryType: INDUSTRY,
    createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01'),
  };
}

function makePaginated(items: OrganizationRecord[] = [makeOrg()]) {
  return {
    data: items.map((o) => ({
      id: o.id, organizationCode: o.organizationCode,
      legalName: o.legalName, displayName: o.displayName,
      status: o.status, industryType: o.industryType.name, createdAt: o.createdAt,
    })),
    total: items.length, page: 1, limit: 20,
    totalPages: Math.ceil(items.length / 20),
  };
}

function makeRepo(overrides: Partial<InstanceType<typeof OrganizationRepository>> = {}) {
  MockedRepo.mockClear();
  MockedRepo.mockImplementation(() => ({
    findAllIndustryTypes:   jest.fn().mockResolvedValue([INDUSTRY]),
    findIndustryTypeById:   jest.fn().mockResolvedValue(INDUSTRY),
    findById:               jest.fn().mockResolvedValue(makeOrg()),
    findByCode:             jest.fn().mockResolvedValue(null),
    findAll:                jest.fn().mockResolvedValue(makePaginated()),
    create:                 jest.fn().mockResolvedValue(makeOrg()),
    update:                 jest.fn().mockResolvedValue(makeOrg()),
    updateStatus:           jest.fn().mockResolvedValue(makeOrg()),
    delete:                 jest.fn().mockResolvedValue(undefined),
    countUsers:             jest.fn().mockResolvedValue(0),
    ...overrides,
  } as unknown as OrganizationRepository));
  return new MockedRepo({} as never) as jest.Mocked<OrganizationRepository>;
}

function makeScopeSvc(isAdmin: boolean) {
  MockedScopeSvc.mockClear();
  MockedScopeSvc.mockImplementation(() => ({
    isAdmin:   jest.fn().mockResolvedValue(isAdmin),
    canAccess: jest.fn().mockResolvedValue(true),
  } as unknown as OrgScopeService));
  return new MockedScopeSvc() as jest.Mocked<OrgScopeService>;
}

// ─── OrganizationService.list — scoping behaviour ────────────────────────────

describe('OrganizationService.list — organization scoping', () => {

  it('returns all organizations when no requesterId is provided (internal/seed use)', async () => {
    const repo     = makeRepo();
    const scopeSvc = makeScopeSvc(false);
    const svc      = new OrganizationService(repo, scopeSvc);

    await svc.list({ page: 1, limit: 20 });

    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, undefined);
    expect(scopeSvc.isAdmin).not.toHaveBeenCalled();
  });

  it('scopes list to own organization for non-admin user', async () => {
    const repo     = makeRepo();
    const scopeSvc = makeScopeSvc(false); // not admin
    const svc      = new OrganizationService(repo, scopeSvc);

    await svc.list({ page: 1, limit: 20 }, {}, NON_ADMIN_ID, ORG_A);

    expect(scopeSvc.isAdmin).toHaveBeenCalledWith(NON_ADMIN_ID);
    // repo.findAll must be called WITH the scopedOrgId
    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, {}, ORG_A);
  });

  it('returns all organizations for admin user (no scopedOrgId applied)', async () => {
    const repo     = makeRepo();
    const scopeSvc = makeScopeSvc(true); // admin
    const svc      = new OrganizationService(repo, scopeSvc);

    await svc.list({ page: 1, limit: 20 }, {}, ADMIN_ID, ORG_A);

    expect(scopeSvc.isAdmin).toHaveBeenCalledWith(ADMIN_ID);
    // repo.findAll must be called WITHOUT a scopedOrgId
    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, {});
  });

  it('passes filters through to repo for non-admin users', async () => {
    const repo     = makeRepo();
    const scopeSvc = makeScopeSvc(false);
    const svc      = new OrganizationService(repo, scopeSvc);

    const filters = { status: OrganizationStatus.ACTIVE };
    await svc.list({ page: 1, limit: 20 }, filters, NON_ADMIN_ID, ORG_A);

    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, filters, ORG_A);
  });

  it('passes filters through to repo for admin users', async () => {
    const repo     = makeRepo();
    const scopeSvc = makeScopeSvc(true);
    const svc      = new OrganizationService(repo, scopeSvc);

    const filters = { status: OrganizationStatus.ACTIVE };
    await svc.list({ page: 1, limit: 20 }, filters, ADMIN_ID, ORG_A);

    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, filters);
  });

  it('falls back to unscoped query when scopeSvc is not injected (backward compat)', async () => {
    const repo = makeRepo();
    const svc  = new OrganizationService(repo); // no scopeSvc

    await svc.list({ page: 1, limit: 20 }, {}, NON_ADMIN_ID, ORG_A);

    expect(repo.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 }, {});
  });
});
