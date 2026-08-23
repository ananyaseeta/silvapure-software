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
  prisma: { auditLog: { create: jest.fn() } },
}));

import { AuditService, AuditAction, AuditResource } from '../audit.service';
import { prisma } from '../../../config/prisma';

const mockCreate = prisma.auditLog.create as jest.Mock;

const BASE_PARAMS = {
  userId:       'c3d4e5f6-a7b8-4901-c234-d56e78f90a12',
  action:       AuditAction.LOGIN_SUCCESS,
  resourceType: AuditResource.AUTH_SESSION,
  resourceId:   'c3d4e5f6-a7b8-4901-c234-d56e78f90a12',
};

// ─── record() — core behaviour ────────────────────────────────────────────────

describe('AuditService.record', () => {
  beforeEach(() => mockCreate.mockResolvedValue({ id: 'audit-id' }));

  it('creates an audit log row with correct core fields', async () => {
    const svc = new AuditService();
    await svc.record(BASE_PARAMS);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId:       BASE_PARAMS.userId,
        action:       BASE_PARAMS.action,
        resourceType: BASE_PARAMS.resourceType,
        resourceId:   BASE_PARAMS.resourceId,
      }),
    });
  });

  it('stores ipAddress and userAgent when provided', async () => {
    const svc = new AuditService();
    await svc.record({ ...BASE_PARAMS, ipAddress: '1.2.3.4', userAgent: 'Jest/1.0' });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ ipAddress: '1.2.3.4', userAgent: 'Jest/1.0' }),
    });
  });

  it('stores null for ipAddress/userAgent when not provided', async () => {
    const svc = new AuditService();
    await svc.record(BASE_PARAMS);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ ipAddress: null, userAgent: null }),
    });
  });

  it('stores oldValues and newValues without sensitive fields', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      oldValues: { status: 'ACTIVE',  password: 'secret123' },
      newValues: { status: 'INACTIVE', passwordHash: '$argon2id$...' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.oldValues).toEqual({ status: 'ACTIVE', password: '[REDACTED]' });
    expect(call.newValues).toEqual({ status: 'INACTIVE', passwordHash: '[REDACTED]' });
  });

  it('stores null for oldValues/newValues when not provided', async () => {
    const svc = new AuditService();
    await svc.record(BASE_PARAMS);

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.oldValues).toBeUndefined();
    expect(call.newValues).toBeUndefined();
  });
});

// ─── Sensitive field stripping ────────────────────────────────────────────────

describe('AuditService — sensitive field redaction', () => {
  const SENSITIVE_KEYS = [
    'password', 'passwordHash', 'currentPassword', 'newPassword',
    'confirmPassword', 'accessToken', 'refreshToken', 'resetToken',
    'token', 'secret', 'apiKey',
  ];

  beforeEach(() => mockCreate.mockResolvedValue({ id: 'audit-id' }));

  it.each(SENSITIVE_KEYS)('redacts "%s" from newValues', async (key) => {
    const svc = new AuditService();
    await svc.record({ ...BASE_PARAMS, newValues: { [key]: 'some-secret-value', email: 'user@test.io' } });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.newValues[key]).toBe('[REDACTED]');
    expect(call.newValues.email).toBe('user@test.io');
  });

  it('does NOT redact safe fields', async () => {
    const svc = new AuditService();
    await svc.record({ ...BASE_PARAMS, newValues: { email: 'user@test.io', status: 'ACTIVE', roles: ['VIEWER'] } });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.newValues).toEqual({ email: 'user@test.io', status: 'ACTIVE', roles: ['VIEWER'] });
  });
});

// ─── Database failure handling ────────────────────────────────────────────────

describe('AuditService — database failure', () => {
  it('does NOT throw when prisma.auditLog.create fails', async () => {
    mockCreate.mockRejectedValue(new Error('DB connection lost'));
    const svc = new AuditService();
    await expect(svc.record(BASE_PARAMS)).resolves.toBeUndefined();
  });

  it('logs the DB error to stderr when create fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCreate.mockRejectedValue(new Error('connection refused'));
    const svc = new AuditService();
    await svc.record(BASE_PARAMS);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[AuditService]'),
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('primary operation is unaffected by audit failure (non-fatal)', async () => {
    mockCreate.mockRejectedValue(new Error('DB down'));
    const svc = new AuditService();
    let primaryCompleted = false;

    await svc.record(BASE_PARAMS);
    primaryCompleted = true;

    expect(primaryCompleted).toBe(true);
  });
});

// ─── Authentication audit events ─────────────────────────────────────────────

describe('AuditService — authentication events', () => {
  beforeEach(() => mockCreate.mockResolvedValue({ id: 'audit-id' }));

  it('records LOGIN_SUCCESS with correct action and resource', async () => {
    const svc = new AuditService();
    await svc.record({ ...BASE_PARAMS, action: AuditAction.LOGIN_SUCCESS, newValues: { email: 'u@test.io' } });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'AUTH_LOGIN_SUCCESS', resourceType: 'AuthSession' }),
    });
  });

  it('records LOGOUT with correct action', async () => {
    const svc = new AuditService();
    await svc.record({ ...BASE_PARAMS, action: AuditAction.LOGOUT });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'AUTH_LOGOUT' }),
    });
  });

  it('records PASSWORD_CHANGED — redacts any password fields', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:    AuditAction.PASSWORD_CHANGED,
      newValues: { changedAt: '2024-01-01', newPassword: 'should-be-redacted' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('AUTH_PASSWORD_CHANGED');
    expect(call.newValues.newPassword).toBe('[REDACTED]');
    expect(call.newValues.changedAt).toBe('2024-01-01');
  });

  it('records PASSWORD_RESET with correct action', async () => {
    const svc = new AuditService();
    await svc.record({ ...BASE_PARAMS, action: AuditAction.PASSWORD_RESET });

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'AUTH_PASSWORD_RESET' }),
    });
  });
});

// ─── User management audit events ────────────────────────────────────────────

describe('AuditService — user management events', () => {
  beforeEach(() => mockCreate.mockResolvedValue({ id: 'audit-id' }));

  it('records USER_CREATED with email in newValues (no passwordHash)', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.USER_CREATED,
      resourceType: AuditResource.USER,
      newValues:    { email: 'new@test.io', passwordHash: 'should-not-appear' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('USER_CREATED');
    expect(call.newValues.email).toBe('new@test.io');
    expect(call.newValues.passwordHash).toBe('[REDACTED]');
  });

  it('records USER_UPDATED with old and new values', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.USER_UPDATED,
      resourceType: AuditResource.USER,
      oldValues:    { firstName: 'Jane' },
      newValues:    { firstName: 'Janet' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('USER_UPDATED');
    expect(call.oldValues).toEqual({ firstName: 'Jane' });
    expect(call.newValues).toEqual({ firstName: 'Janet' });
  });

  it('records USER_DELETED with old values snapshot', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.USER_DELETED,
      resourceType: AuditResource.USER,
      oldValues:    { email: 'deleted@test.io', status: 'ACTIVE' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('USER_DELETED');
    expect(call.oldValues.email).toBe('deleted@test.io');
  });

  it('records USER_STATUS_CHANGED with before/after status', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.USER_STATUS_CHANGED,
      resourceType: AuditResource.USER,
      oldValues:    { status: 'ACTIVE' },
      newValues:    { status: 'INACTIVE' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('USER_STATUS_CHANGED');
    expect(call.oldValues.status).toBe('ACTIVE');
    expect(call.newValues.status).toBe('INACTIVE');
  });

  it('records USER_ROLES_CHANGED with before/after roles', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.USER_ROLES_CHANGED,
      resourceType: AuditResource.USER,
      oldValues:    { roles: ['VIEWER'] },
      newValues:    { roles: ['PLANT_MANAGER'] },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('USER_ROLES_CHANGED');
    expect(call.oldValues.roles).toEqual(['VIEWER']);
    expect(call.newValues.roles).toEqual(['PLANT_MANAGER']);
  });
});

// ─── Organization management audit events ────────────────────────────────────

describe('AuditService — organization management events', () => {
  beforeEach(() => mockCreate.mockResolvedValue({ id: 'audit-id' }));

  it('records ORG_CREATED with correct action and resource type', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.ORG_CREATED,
      resourceType: AuditResource.ORGANIZATION,
      newValues:    { organizationCode: 'TEST-001', legalName: 'Test Ltd' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('ORG_CREATED');
    expect(call.resourceType).toBe('Organization');
    expect(call.newValues.organizationCode).toBe('TEST-001');
  });

  it('records ORG_UPDATED with old and new values', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.ORG_UPDATED,
      resourceType: AuditResource.ORGANIZATION,
      oldValues:    { legalName: 'Old Name' },
      newValues:    { legalName: 'New Name' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('ORG_UPDATED');
    expect(call.oldValues.legalName).toBe('Old Name');
    expect(call.newValues.legalName).toBe('New Name');
  });

  it('records ORG_STATUS_CHANGED with before/after status', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.ORG_STATUS_CHANGED,
      resourceType: AuditResource.ORGANIZATION,
      oldValues:    { status: 'ACTIVE' },
      newValues:    { status: 'INACTIVE' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('ORG_STATUS_CHANGED');
    expect(call.newValues.status).toBe('INACTIVE');
  });

  it('records ORG_DELETED with old values snapshot', async () => {
    const svc = new AuditService();
    await svc.record({
      ...BASE_PARAMS,
      action:       AuditAction.ORG_DELETED,
      resourceType: AuditResource.ORGANIZATION,
      oldValues:    { organizationCode: 'DEL-001', legalName: 'Deleted Org' },
    });

    const call = mockCreate.mock.calls[0][0].data;
    expect(call.action).toBe('ORG_DELETED');
    expect(call.oldValues.organizationCode).toBe('DEL-001');
  });
});
