/**
 * Unit tests — OrganizationService
 *
 * OrganizationRepository is fully mocked — no DB connection required.
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

import { OrganizationService }    from '../service';
import { OrganizationRepository } from '../repository';
import {
  OrganizationError,
  OrganizationErrorCode,
  type OrganizationRecord,
  type IndustryTypeRecord,
  type OrganizationSummary,
  type PaginatedResult,
} from '../types';
import { OrganizationStatus } from '@prisma/client';

jest.mock('../repository');
const MockedRepo = OrganizationRepository as jest.MockedClass<typeof OrganizationRepository>;

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const INDUSTRY: IndustryTypeRecord = {
  id:          'f1e2d3c4-b5a6-4789-8012-c34d56e78f90',
  name:        'Pharmaceuticals',
  description: null,
};

function makeOrg(overrides: Partial<OrganizationRecord> = {}): OrganizationRecord {
  return {
    id:               'a1b2c3d4-e5f6-4789-a012-b34c56d78e90',
    organizationCode: 'PHARMA-001',
    legalName:        'Test Pharma Ltd',
    displayName:      'Test Pharma',
    email:            'contact@testpharma.com',
    phone:            null,
    website:          null,
    status:           OrganizationStatus.ACTIVE,
    industryTypeId:   'f1e2d3c4-b5a6-4789-8012-c34d56e78f90',
    industryType:     INDUSTRY,
    createdAt:        new Date('2024-01-01'),
    updatedAt:        new Date('2024-01-01'),
    ...overrides,
  };
}

function makeRepo(): jest.Mocked<OrganizationRepository> {
  MockedRepo.mockClear();
  MockedRepo.mockImplementation(() => ({
    findAllIndustryTypes:   jest.fn().mockResolvedValue([INDUSTRY]),
    findIndustryTypeById:   jest.fn().mockResolvedValue(INDUSTRY),
    findById:               jest.fn().mockResolvedValue(makeOrg()),
    findByCode:             jest.fn().mockResolvedValue(null),
    findAll:                jest.fn().mockResolvedValue({ data: [makeOrg()], total: 1, page: 1, limit: 20, totalPages: 1 }),
    create:                 jest.fn().mockResolvedValue(makeOrg()),
    update:                 jest.fn().mockResolvedValue(makeOrg()),
    updateStatus:           jest.fn().mockResolvedValue(makeOrg()),
    delete:                 jest.fn().mockResolvedValue(undefined),
    countUsers:             jest.fn().mockResolvedValue(0),
  } as unknown as OrganizationRepository));

  return new MockedRepo({} as never) as jest.Mocked<OrganizationRepository>;
}

// ─── listIndustryTypes ────────────────────────────────────────────────────────

describe('OrganizationService.listIndustryTypes', () => {
  it('returns all industry types from repository', async () => {
    const repo = makeRepo();
    const svc  = new OrganizationService(repo);

    const result = await svc.listIndustryTypes();
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('Pharmaceuticals');
    expect(repo.findAllIndustryTypes).toHaveBeenCalledTimes(1);
  });
});

// ─── list ─────────────────────────────────────────────────────────────────────

describe('OrganizationService.list', () => {
  it('returns paginated organizations', async () => {
    const repo   = makeRepo();
    const svc    = new OrganizationService(repo);
    const result = await svc.list({ page: 1, limit: 20 });

    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('passes filters to the repository', async () => {
    const repo = makeRepo();
    const svc  = new OrganizationService(repo);

    await svc.list({ page: 1, limit: 10 }, { status: OrganizationStatus.ACTIVE });

    expect(repo.findAll).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      { status: OrganizationStatus.ACTIVE },
    );
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe('OrganizationService.getById', () => {
  it('returns the organization when found', async () => {
    const repo = makeRepo();
    const svc  = new OrganizationService(repo);
    const org  = await svc.getById('a1b2c3d4-e5f6-4789-a012-b34c56d78e90');

    expect(org.id).toBe('a1b2c3d4-e5f6-4789-a012-b34c56d78e90');
    expect(org.organizationCode).toBe('PHARMA-001');
  });

  it('throws OrganizationError(NOT_FOUND) when organization does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new OrganizationService(repo);

    await expect(svc.getById('missing-id')).rejects.toThrow(
      expect.objectContaining({
        code:       OrganizationErrorCode.NOT_FOUND,
        statusHint: 404,
      }),
    );
  });

  it('throws an instance of OrganizationError', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new OrganizationService(repo);

    await expect(svc.getById('x')).rejects.toBeInstanceOf(OrganizationError);
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('OrganizationService.create', () => {
  const dto = {
    organizationCode: 'NEW-001',
    legalName:        'New Org Ltd',
    displayName:      'New Org',
    industryTypeId:   INDUSTRY.id,
    email:            'new@org.io',
  };

  it('creates and returns a new organization', async () => {
    const repo = makeRepo();
    const svc  = new OrganizationService(repo);

    const org = await svc.create(dto);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(org).toBeDefined();
  });

  it('throws CODE_TAKEN(409) when organization code already exists', async () => {
    const repo = makeRepo();
    repo.findByCode.mockResolvedValue(makeOrg());
    const svc = new OrganizationService(repo);

    await expect(svc.create(dto)).rejects.toThrow(
      expect.objectContaining({ code: OrganizationErrorCode.CODE_TAKEN, statusHint: 409 }),
    );
  });

  it('does not call create when code is taken', async () => {
    const repo = makeRepo();
    repo.findByCode.mockResolvedValue(makeOrg());
    const svc = new OrganizationService(repo);

    await expect(svc.create(dto)).rejects.toThrow(OrganizationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('throws INDUSTRY_NOT_FOUND(422) when industry type does not exist', async () => {
    const repo = makeRepo();
    repo.findIndustryTypeById.mockResolvedValue(null);
    const svc = new OrganizationService(repo);

    await expect(svc.create(dto)).rejects.toThrow(
      expect.objectContaining({
        code:       OrganizationErrorCode.INDUSTRY_NOT_FOUND,
        statusHint: 422,
      }),
    );
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('OrganizationService.update', () => {
  it('updates and returns the organization', async () => {
    const repo = makeRepo();
    const svc  = new OrganizationService(repo);

    const result = await svc.update('org-uuid-001', { displayName: 'Updated Name' });
    expect(repo.update).toHaveBeenCalledWith('org-uuid-001', { displayName: 'Updated Name' });
    expect(result).toBeDefined();
  });

  it('throws NOT_FOUND when organization does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new OrganizationService(repo);

    await expect(svc.update('bad-id', { displayName: 'x' })).rejects.toThrow(
      expect.objectContaining({ code: OrganizationErrorCode.NOT_FOUND }),
    );
  });
});

// ─── updateStatus ────────────────────────────────────────────────────────────

describe('OrganizationService.updateStatus', () => {
  it('updates status and returns the organization', async () => {
    const repo = makeRepo();
    const svc  = new OrganizationService(repo);

    await svc.updateStatus('org-uuid-001', { status: OrganizationStatus.INACTIVE });
    expect(repo.updateStatus).toHaveBeenCalledWith('org-uuid-001', OrganizationStatus.INACTIVE);
  });

  it('throws NOT_FOUND when organization does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new OrganizationService(repo);

    await expect(
      svc.updateStatus('bad-id', { status: OrganizationStatus.INACTIVE }),
    ).rejects.toThrow(
      expect.objectContaining({ code: OrganizationErrorCode.NOT_FOUND }),
    );
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('OrganizationService.delete', () => {
  it('deletes successfully when organization has no users', async () => {
    const repo = makeRepo();
    repo.countUsers.mockResolvedValue(0);
    const svc = new OrganizationService(repo);

    await expect(svc.delete('org-uuid-001')).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith('org-uuid-001');
  });

  it('throws CANNOT_DELETE_ACTIVE(409) when organization has users', async () => {
    const repo = makeRepo();
    repo.countUsers.mockResolvedValue(5);
    const svc = new OrganizationService(repo);

    await expect(svc.delete('org-uuid-001')).rejects.toThrow(
      expect.objectContaining({
        code:       OrganizationErrorCode.CANNOT_DELETE_ACTIVE,
        statusHint: 409,
      }),
    );
  });

  it('does not call repo.delete when org has users', async () => {
    const repo = makeRepo();
    repo.countUsers.mockResolvedValue(3);
    const svc = new OrganizationService(repo);

    await expect(svc.delete('org-uuid-001')).rejects.toThrow(OrganizationError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when organization does not exist', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(null);
    const svc = new OrganizationService(repo);

    await expect(svc.delete('missing-id')).rejects.toThrow(
      expect.objectContaining({ code: OrganizationErrorCode.NOT_FOUND }),
    );
  });
});

// ─── OrganizationError ────────────────────────────────────────────────────────

describe('OrganizationError', () => {
  it('is an instance of Error', () => {
    const err = new OrganizationError(OrganizationErrorCode.NOT_FOUND, 'not found');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('OrganizationError');
  });

  it('has default statusHint of 400', () => {
    const err = new OrganizationError(OrganizationErrorCode.CODE_TAKEN, 'taken');
    expect(err.statusHint).toBe(400);
  });

  it('accepts a custom statusHint', () => {
    const err = new OrganizationError(OrganizationErrorCode.NOT_FOUND, 'nf', 404);
    expect(err.statusHint).toBe(404);
  });

  it('exposes the code property', () => {
    const err = new OrganizationError(OrganizationErrorCode.INDUSTRY_NOT_FOUND, 'msg');
    expect(err.code).toBe(OrganizationErrorCode.INDUSTRY_NOT_FOUND);
  });
});
