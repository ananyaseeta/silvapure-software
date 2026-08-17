/**
 * Unit tests — Organization Controller
 *
 * OrganizationService is mocked. Tests verify HTTP response shaping,
 * Zod validation enforcement, and error propagation to next().
 *
 * NOTE: All ID fixtures use real UUID v4 strings because Zod v4 validates
 *       UUID format strictly (requires version nibble 1-8).
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

// ── mocks must be declared before imports ────────────────────────────────────
jest.mock('../../../config/prisma', () => ({ prisma: {} }));
jest.mock('../repository');
jest.mock('../service');

import type { Request, Response, NextFunction } from 'express';
import { OrganizationStatus } from '@prisma/client';
import {
  listIndustryTypes,
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  updateOrganizationStatus,
  deleteOrganization,
} from '../controller';
import { OrganizationService }  from '../service';
import { OrganizationError, OrganizationErrorCode } from '../types';
import type { OrganizationRecord, IndustryTypeRecord } from '../types';

const MockedService = OrganizationService as jest.MockedClass<typeof OrganizationService>;

// ─── UUID fixtures (valid v4 UUIDs) ───────────────────────────────────────────
const ORG_ID      = 'a1b2c3d4-e5f6-4789-a012-b34c56d78e90';
const INDUSTRY_ID = 'f1e2d3c4-b5a6-4789-8012-c34d56e78f90';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const INDUSTRY: IndustryTypeRecord = {
  id:          INDUSTRY_ID,
  name:        'Pharma',
  description: null,
};

function makeOrg(): OrganizationRecord {
  return {
    id:               ORG_ID,
    organizationCode: 'TEST-001',
    legalName:        'Test Org Ltd',
    displayName:      'Test Org',
    email:            'test@org.io',
    phone:            null,
    website:          null,
    status:           OrganizationStatus.ACTIVE,
    industryTypeId:   INDUSTRY_ID,
    industryType:     INDUSTRY,
    createdAt:        new Date('2024-01-01'),
    updatedAt:        new Date('2024-01-01'),
  };
}

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    body:   {},
    params: {},
    query:  {},
    user:   { id: ORG_ID, email: 'req@test.io', organizationId: ORG_ID, status: 'ACTIVE' },
    ...overrides,
  } as unknown as Request;
}

function makeRes(): { res: Response; json: jest.Mock; status: jest.Mock; send: jest.Mock } {
  const json   = jest.fn().mockReturnThis();
  const send   = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json, send });
  return { res: { status, json, send } as unknown as Response, json, status, send };
}

// ─── Helper: build a fully wired mock service instance ────────────────────────

function buildMockService(
  overrides: Partial<{
    listIndustryTypes: jest.Mock;
    list:              jest.Mock;
    getById:           jest.Mock;
    create:            jest.Mock;
    update:            jest.Mock;
    updateStatus:      jest.Mock;
    delete:            jest.Mock;
  }> = {},
) {
  const base = {
    listIndustryTypes: jest.fn().mockResolvedValue([INDUSTRY]),
    list:              jest.fn().mockResolvedValue({ data: [makeOrg()], total: 1, page: 1, limit: 20, totalPages: 1 }),
    getById:           jest.fn().mockResolvedValue(makeOrg()),
    create:            jest.fn().mockResolvedValue(makeOrg()),
    update:            jest.fn().mockResolvedValue(makeOrg()),
    updateStatus:      jest.fn().mockResolvedValue(makeOrg()),
    delete:            jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  MockedService.mockImplementation(() => base as unknown as OrganizationService);
  return base;
}

// ─── listIndustryTypes ────────────────────────────────────────────────────────

describe('listIndustryTypes', () => {
  it('responds 200 with industry types array', async () => {
    buildMockService();
    const req = makeReq();
    const { res, status, json } = makeRes();
    const next = jest.fn();

    await listIndustryTypes(req, res, next);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: [INDUSTRY] });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next(err) when service throws', async () => {
    const m = buildMockService();
    m.listIndustryTypes.mockRejectedValue(new Error('DB error'));
    const next = jest.fn();
    await listIndustryTypes(makeReq(), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── listOrganizations ────────────────────────────────────────────────────────

describe('listOrganizations', () => {
  it('responds 200 with paginated result', async () => {
    buildMockService();
    const req = makeReq({ query: { page: '1', limit: '20' } as never });
    const { res, status } = makeRes();
    const next = jest.fn();

    await listOrganizations(req, res, next);

    expect(status).toHaveBeenCalledWith(200);
  });

  it('uses default pagination when no query params provided', async () => {
    const m = buildMockService();
    const req = makeReq({ query: {} });
    await listOrganizations(req, makeRes().res, jest.fn());
    expect(m.list).toHaveBeenCalledWith(
      { page: 1, limit: 20 },
      expect.any(Object),
      expect.any(String),
      expect.any(String),
    );
  });

  it('calls next(err) on service failure', async () => {
    const m = buildMockService();
    m.list.mockRejectedValue(new Error('fail'));
    const next = jest.fn();
    await listOrganizations(makeReq({ query: {} }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── getOrganization ──────────────────────────────────────────────────────────

describe('getOrganization', () => {
  it('responds 200 with organization data', async () => {
    buildMockService();
    const req = makeReq({ params: { id: ORG_ID } as never });
    const { res, status, json } = makeRes();
    const next = jest.fn();

    await getOrganization(req, res, next);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: makeOrg() });
  });

  it('calls next(ZodError) for invalid UUID param', async () => {
    buildMockService();
    const next = jest.fn();
    await getOrganization(
      makeReq({ params: { id: 'not-a-uuid' } as never }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('propagates OrganizationError to next', async () => {
    const m = buildMockService();
    m.getById.mockRejectedValue(
      new OrganizationError(OrganizationErrorCode.NOT_FOUND, 'not found', 404),
    );
    const next = jest.fn();
    await getOrganization(makeReq({ params: { id: ORG_ID } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: OrganizationErrorCode.NOT_FOUND }),
    );
  });
});

// ─── createOrganization ───────────────────────────────────────────────────────

describe('createOrganization', () => {
  const validBody = {
    organizationCode: 'NEW-001',
    legalName:        'New Org Ltd',
    displayName:      'New Org',
    industryTypeId:   INDUSTRY_ID,
  };

  it('responds 201 with created organization', async () => {
    buildMockService();
    const { res, status } = makeRes();
    const next = jest.fn();

    await createOrganization(makeReq({ body: validBody }), res, next);

    expect(status).toHaveBeenCalledWith(201);
  });

  it('calls next(ZodError) for invalid organizationCode format', async () => {
    buildMockService();
    const next = jest.fn();
    await createOrganization(
      makeReq({ body: { ...validBody, organizationCode: 'invalid code spaces' } }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('calls next(ZodError) for missing required fields', async () => {
    buildMockService();
    const next = jest.fn();
    await createOrganization(
      makeReq({ body: { organizationCode: 'OK-001' } }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('propagates CODE_TAKEN error from service to next', async () => {
    const m = buildMockService();
    m.create.mockRejectedValue(
      new OrganizationError(OrganizationErrorCode.CODE_TAKEN, 'taken', 409),
    );
    const next = jest.fn();
    await createOrganization(makeReq({ body: validBody }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: OrganizationErrorCode.CODE_TAKEN }),
    );
  });
});

// ─── updateOrganization ───────────────────────────────────────────────────────

describe('updateOrganization', () => {
  it('responds 200 on successful update', async () => {
    buildMockService();
    const { res, status } = makeRes();
    const next = jest.fn();

    await updateOrganization(
      makeReq({ params: { id: ORG_ID } as never, body: { displayName: 'New Name' } }),
      res,
      next,
    );

    expect(status).toHaveBeenCalledWith(200);
  });

  it('calls next(ZodError) when body is empty (refine rejects empty object)', async () => {
    buildMockService();
    const next = jest.fn();
    await updateOrganization(
      makeReq({ params: { id: ORG_ID } as never, body: {} }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── updateOrganizationStatus ─────────────────────────────────────────────────

describe('updateOrganizationStatus', () => {
  it('responds 200 when status is valid', async () => {
    const m = buildMockService();
    const { res, status } = makeRes();
    const next = jest.fn();

    await updateOrganizationStatus(
      makeReq({ params: { id: ORG_ID } as never, body: { status: OrganizationStatus.INACTIVE } }),
      res,
      next,
    );

    expect(status).toHaveBeenCalledWith(200);
    expect(m.updateStatus).toHaveBeenCalledWith(ORG_ID, { status: OrganizationStatus.INACTIVE });
  });

  it('calls next(ZodError) when status value is invalid', async () => {
    buildMockService();
    const next = jest.fn();
    await updateOrganizationStatus(
      makeReq({ params: { id: ORG_ID } as never, body: { status: 'INVALID' } }),
      makeRes().res,
      next,
    );
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ─── deleteOrganization ───────────────────────────────────────────────────────

describe('deleteOrganization', () => {
  it('responds 204 on successful delete', async () => {
    buildMockService();
    const { res, status, send } = makeRes();
    const next = jest.fn();

    await deleteOrganization(makeReq({ params: { id: ORG_ID } as never }), res, next);

    expect(status).toHaveBeenCalledWith(204);
    expect(send).toHaveBeenCalled();
  });

  it('propagates CANNOT_DELETE_ACTIVE error to next', async () => {
    const m = buildMockService();
    m.delete.mockRejectedValue(
      new OrganizationError(OrganizationErrorCode.CANNOT_DELETE_ACTIVE, 'has users', 409),
    );
    const next = jest.fn();
    await deleteOrganization(makeReq({ params: { id: ORG_ID } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ code: OrganizationErrorCode.CANNOT_DELETE_ACTIVE }),
    );
  });

  it('calls next(ZodError) for invalid UUID param', async () => {
    buildMockService();
    const next = jest.fn();
    await deleteOrganization(makeReq({ params: { id: 'bad' } as never }), makeRes().res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
