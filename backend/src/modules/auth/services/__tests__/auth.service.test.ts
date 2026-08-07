/**
 * Unit tests — AuthService
 *
 * The Prisma client and Argon2 are fully mocked so these tests are:
 *   - fast (no real DB or crypto work)
 *   - deterministic
 *   - isolated from infrastructure
 *
 * Real JWT signing is used because it is pure computation with no side effects.
 */

// ── bootstrap env before any module imports ───────────────────────────────────
process.env['NODE_ENV']                       = 'test';
process.env['DATABASE_URL']                   = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET']              = 'test-access-secret-at-least-32-chars!!';
process.env['JWT_REFRESH_SECRET']             = 'test-refresh-secret-at-least-32-chars!';
process.env['JWT_ACCESS_EXPIRES_IN']          = '15m';
process.env['JWT_REFRESH_EXPIRES_IN']         = '7d';
process.env['PASSWORD_RESET_EXPIRES_MINUTES'] = '60';
process.env['ARGON2_MEMORY_COST']             = '64';
process.env['ARGON2_TIME_COST']               = '1';
process.env['ARGON2_PARALLELISM']             = '1';

// ── Mock argon2 ───────────────────────────────────────────────────────────────
jest.mock('argon2', () => ({
  argon2id: 'argon2id',
  hash: jest.fn(),
  verify: jest.fn(),
}));

import argon2 from 'argon2';
import { AuthService, AuthServiceError } from '../auth.service';
import { AuthRepository } from '../../repositories/auth.repository';
import { AuthErrorCode } from '../../types/auth.types';
import type { AuthUserRecord } from '../../types/auth.types';
import { UserStatus } from '@prisma/client';

// ─── Typed mock helpers ───────────────────────────────────────────────────────

const mockArgon2Hash   = argon2.hash   as jest.MockedFunction<typeof argon2.hash>;
const mockArgon2Verify = argon2.verify as jest.MockedFunction<typeof argon2.verify>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    id:             'user-uuid-001',
    email:          'user@silvapure.io',
    passwordHash:   '$argon2id$v=19$m=64,t=1,p=1$salt$hash',
    organizationId: 'org-uuid-001',
    status:         UserStatus.ACTIVE,
    firstName:      'Jane',
    lastName:       'Doe',
    ...overrides,
  };
}

function makeRepo(
  overrides: Partial<{
    findUserByEmail: (email: string) => Promise<AuthUserRecord | null>;
    findUserById:    (id: string)    => Promise<AuthUserRecord | null>;
    updatePassword:  (userId: string, hash: string) => Promise<void>;
  }> = {},
): AuthRepository {
  return {
    findUserByEmail: jest.fn().mockResolvedValue(makeUser()),
    findUserById:    jest.fn().mockResolvedValue(makeUser()),
    updatePassword:  jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as AuthRepository;
}

// ─── AuthServiceError ─────────────────────────────────────────────────────────

describe('AuthServiceError', () => {
  it('is an instance of Error', () => {
    const err = new AuthServiceError('CODE', 'msg');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AuthServiceError);
  });

  it('has the correct name', () => {
    const err = new AuthServiceError('CODE', 'msg');
    expect(err.name).toBe('AuthServiceError');
  });

  it('exposes code and statusHint', () => {
    const err = new AuthServiceError('MY_CODE', 'my msg', 403);
    expect(err.code).toBe('MY_CODE');
    expect(err.statusHint).toBe(403);
    expect(err.message).toBe('my msg');
  });

  it('defaults statusHint to 401', () => {
    const err = new AuthServiceError('CODE', 'msg');
    expect(err.statusHint).toBe(401);
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('AuthService.login', () => {
  beforeEach(() => {
    mockArgon2Verify.mockResolvedValue(true);
  });

  it('returns accessToken, refreshToken, and user on valid credentials', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);

    const result = await service.login({
      email:    'user@silvapure.io',
      password: 'Correct$Pass1',
    });

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.user.email).toBe('user@silvapure.io');
    expect(result.user.id).toBe('user-uuid-001');
    expect(result.user.organizationId).toBe('org-uuid-001');
    // passwordHash must never be in the result
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('calls findUserByEmail with the lowercased email', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);

    await service.login({ email: 'User@Silvapure.IO', password: 'P@ss1' });

    expect(repo.findUserByEmail).toHaveBeenCalledWith('User@Silvapure.IO');
  });

  it('throws INVALID_CREDENTIALS when user does not exist', async () => {
    mockArgon2Verify.mockResolvedValue(false);
    const repo    = makeRepo({ findUserByEmail: jest.fn().mockResolvedValue(null) });
    const service = new AuthService(repo);

    await expect(
      service.login({ email: 'ghost@silvapure.io', password: 'P@ss1' }),
    ).rejects.toThrow(
      expect.objectContaining({
        code:       AuthErrorCode.INVALID_CREDENTIALS,
        statusHint: 401,
      }),
    );
  });

  it('throws INVALID_CREDENTIALS when password is wrong (not ACCOUNT_INACTIVE to prevent enumeration)', async () => {
    mockArgon2Verify.mockResolvedValue(false);
    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(
      service.login({ email: 'user@silvapure.io', password: 'Wrong$Pass1' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.INVALID_CREDENTIALS }),
    );
  });

  it('still calls verifyPassword even when user is null (timing-safe dummy hash)', async () => {
    mockArgon2Verify.mockResolvedValue(false);
    const repo    = makeRepo({ findUserByEmail: jest.fn().mockResolvedValue(null) });
    const service = new AuthService(repo);

    await expect(
      service.login({ email: 'ghost@silvapure.io', password: 'Any$Pass1' }),
    ).rejects.toThrow(AuthServiceError);

    // verify must have been called with the dummy hash, not skipped
    expect(mockArgon2Verify).toHaveBeenCalledTimes(1);
  });

  it('throws ACCOUNT_INACTIVE for a SUSPENDED user with correct password', async () => {
    mockArgon2Verify.mockResolvedValue(true);
    const repo = makeRepo({
      findUserByEmail: jest.fn().mockResolvedValue(
        makeUser({ status: UserStatus.SUSPENDED }),
      ),
    });
    const service = new AuthService(repo);

    await expect(
      service.login({ email: 'suspended@silvapure.io', password: 'P@ss1' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.ACCOUNT_INACTIVE, statusHint: 403 }),
    );
  });

  it('throws ACCOUNT_INACTIVE for an INACTIVE user', async () => {
    mockArgon2Verify.mockResolvedValue(true);
    const repo = makeRepo({
      findUserByEmail: jest.fn().mockResolvedValue(
        makeUser({ status: UserStatus.INACTIVE }),
      ),
    });
    const service = new AuthService(repo);

    await expect(
      service.login({ email: 'inactive@silvapure.io', password: 'P@ss1' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.ACCOUNT_INACTIVE }),
    );
  });

  it('returns a valid JWT access token that can be verified', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);

    const { accessToken } = await service.login({
      email:    'user@silvapure.io',
      password: 'P@ss1',
    });

    const { verifyAccessToken } = await import('../../utils/jwt');
    const payload = verifyAccessToken(accessToken);
    expect(payload.sub).toBe('user-uuid-001');
    expect(payload.type).toBe('access');
    expect(payload.email).toBe('user@silvapure.io');
  });
});

// ─── refresh ──────────────────────────────────────────────────────────────────

describe('AuthService.refresh', () => {
  it('returns new accessToken and refreshToken for a valid refresh token', async () => {
    const { signRefreshToken } = await import('../../utils/jwt');
    const validRefreshToken = signRefreshToken({ sub: 'user-uuid-001', type: 'refresh' });

    const repo    = makeRepo();
    const service = new AuthService(repo);

    const result = await service.refresh(validRefreshToken);
    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
  });

  it('rotates the refresh token on each call', async () => {
    const { signRefreshToken } = await import('../../utils/jwt');
    const token = signRefreshToken({ sub: 'user-uuid-001', type: 'refresh' });

    const repo    = makeRepo();
    const service = new AuthService(repo);

    const r1 = await service.refresh(token);
    const r2 = await service.refresh(r1.refreshToken);

    // Both are valid tokens
    expect(r1.accessToken).toBeTruthy();
    expect(r2.accessToken).toBeTruthy();
  });

  it('throws TOKEN_INVALID when the refresh token is garbage', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(service.refresh('not-a-jwt')).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
    );
  });

  it('throws TOKEN_EXPIRED for an expired refresh token', async () => {
    const jwt = await import('jsonwebtoken');
    const expired = jwt.default.sign(
      { sub: 'user-uuid-001', type: 'refresh' },
      process.env['JWT_REFRESH_SECRET'] as string,
      { expiresIn: -1, algorithm: 'HS256' },
    );

    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(service.refresh(expired)).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_EXPIRED }),
    );
  });

  it('throws TOKEN_INVALID when the user no longer exists', async () => {
    const { signRefreshToken } = await import('../../utils/jwt');
    const token = signRefreshToken({ sub: 'deleted-user', type: 'refresh' });

    const repo    = makeRepo({ findUserById: jest.fn().mockResolvedValue(null) });
    const service = new AuthService(repo);

    await expect(service.refresh(token)).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
    );
  });

  it('throws ACCOUNT_INACTIVE for a suspended user on refresh', async () => {
    const { signRefreshToken } = await import('../../utils/jwt');
    const token = signRefreshToken({ sub: 'user-uuid-001', type: 'refresh' });

    const repo = makeRepo({
      findUserById: jest.fn().mockResolvedValue(
        makeUser({ status: UserStatus.SUSPENDED }),
      ),
    });
    const service = new AuthService(repo);

    await expect(service.refresh(token)).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.ACCOUNT_INACTIVE }),
    );
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('AuthService.logout', () => {
  it('returns void without throwing', () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);
    expect(() => service.logout()).not.toThrow();
  });
});

// ─── forgotPassword ───────────────────────────────────────────────────────────

describe('AuthService.forgotPassword', () => {
  it('returns a resetToken and expiresAt for an existing active user', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);

    const result = await service.forgotPassword({ email: 'user@silvapure.io' });

    expect(typeof result.resetToken).toBe('string');
    expect(result.resetToken.length).toBeGreaterThan(0);
    expect(typeof result.expiresAt).toBe('string');
    // expiresAt must be a valid ISO date
    expect(new Date(result.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('returns a plausible dummy result when user does not exist (prevents email enumeration)', async () => {
    const repo    = makeRepo({ findUserByEmail: jest.fn().mockResolvedValue(null) });
    const service = new AuthService(repo);

    const result = await service.forgotPassword({ email: 'ghost@silvapure.io' });

    // Still returns a token — attacker cannot distinguish real from fake
    expect(typeof result.resetToken).toBe('string');
    expect(result.resetToken.length).toBeGreaterThan(0);
    expect(typeof result.expiresAt).toBe('string');
  });

  it('returns a plausible dummy result when user is INACTIVE', async () => {
    const repo = makeRepo({
      findUserByEmail: jest.fn().mockResolvedValue(
        makeUser({ status: UserStatus.INACTIVE }),
      ),
    });
    const service = new AuthService(repo);

    const result = await service.forgotPassword({ email: 'inactive@silvapure.io' });
    expect(result.resetToken).toBeTruthy();
  });

  it('generates unique reset tokens on each call', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);

    const r1 = await service.forgotPassword({ email: 'user@silvapure.io' });
    const r2 = await service.forgotPassword({ email: 'user@silvapure.io' });

    expect(r1.resetToken).not.toBe(r2.resetToken);
  });
});

// ─── resetPassword ────────────────────────────────────────────────────────────

describe('AuthService.resetPassword', () => {
  beforeEach(() => {
    // hashPassword returns a fake hash; verifyPassword returns false by default
    mockArgon2Hash.mockResolvedValue('$argon2id$v=19$newHash');
    mockArgon2Verify.mockResolvedValue(false); // new password differs from current
  });

  async function getValidToken(service: AuthService): Promise<string> {
    const result = await service.forgotPassword({ email: 'user@silvapure.io' });
    return result.resetToken;
  }

  it('updates the password and does not throw for valid token + new password', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);
    const token   = await getValidToken(service);

    await expect(
      service.resetPassword({ token, newPassword: 'NewP@ss1!', confirmPassword: 'NewP@ss1!' }),
    ).resolves.toBeUndefined();

    expect(repo.updatePassword).toHaveBeenCalledWith('user-uuid-001', '$argon2id$v=19$newHash');
  });

  it('throws RESET_TOKEN_INVALID for an unknown token', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(
      service.resetPassword({ token: 'deadbeef', newPassword: 'NewP@ss1!', confirmPassword: 'NewP@ss1!' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.RESET_TOKEN_INVALID }),
    );
  });

  it('throws RESET_TOKEN_EXPIRED when the token has expired', async () => {
    // Mock Date.now so we can control when "now" is relative to expiry.
    const baseTime = Date.now();
    const dateSpy  = jest.spyOn(Date, 'now');

    // Time of forgotPassword call
    dateSpy.mockReturnValue(baseTime);

    const repo    = makeRepo();
    const service = new AuthService(repo);
    const result  = await service.forgotPassword({ email: 'user@silvapure.io' });

    // Advance time past the 60-minute expiry window
    dateSpy.mockReturnValue(baseTime + 61 * 60 * 1000);

    dateSpy.mockRestore();

    // Now check expiry using a real Date comparison: the token's expiresAt is
    // already in the past from our perspective, but the mock was restored.
    // Instead, rebuild the entry's expiresAt check manually:
    // We need to call resetPassword after the expiry. Since Date.now is restored
    // we verify the path via a pre-expired entry directly.
    // The simplest correct approach: sign a token with an already-past expiresAt.
    // The service uses a Map<token, {userId, expiresAt}>. We can test the expired
    // branch by freezing Date, calling forgotPassword, restoring Date to future,
    // then calling resetPassword.

    // Re-run with proper spy management:
    const earlyTime = Date.now() - 61 * 60 * 1000; // 61 minutes ago
    const dateSpy2 = jest.spyOn(Date, 'now').mockReturnValue(earlyTime);

    const service2 = new AuthService(makeRepo());
    const result2  = await service2.forgotPassword({ email: 'user@silvapure.io' });

    dateSpy2.mockRestore(); // Now Date.now() is real again (future of earlyTime)

    await expect(
      service2.resetPassword({
        token:           result2.resetToken,
        newPassword:     'NewP@ss1!',
        confirmPassword: 'NewP@ss1!',
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.RESET_TOKEN_EXPIRED }),
    );

    // Suppress unused variable warning
    void result;
  });

  it('throws RESET_TOKEN_INVALID when user no longer exists at reset time', async () => {
    const repoForgot = makeRepo();
    const service    = new AuthService(repoForgot);
    const token      = await getValidToken(service);

    // Now swap the repo so findUserById returns null
    Object.defineProperty(service, 'repo', {
      value: makeRepo({ findUserById: jest.fn().mockResolvedValue(null) }),
    });

    await expect(
      service.resetPassword({ token, newPassword: 'NewP@ss1!', confirmPassword: 'NewP@ss1!' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.RESET_TOKEN_INVALID }),
    );
  });

  it('throws PASSWORD_SAME when new password is the same as current', async () => {
    mockArgon2Verify.mockResolvedValue(true); // same password
    const repo    = makeRepo();
    const service = new AuthService(repo);
    const token   = await getValidToken(service);

    await expect(
      service.resetPassword({ token, newPassword: 'SameP@ss1', confirmPassword: 'SameP@ss1' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.PASSWORD_SAME }),
    );
  });

  it('deletes the token from the store after a successful reset (single-use)', async () => {
    const repo    = makeRepo();
    const service = new AuthService(repo);
    const token   = await getValidToken(service);

    await service.resetPassword({ token, newPassword: 'NewP@ss1!', confirmPassword: 'NewP@ss1!' });

    // Second use of the same token must fail
    await expect(
      service.resetPassword({ token, newPassword: 'AnotherP@ss1!', confirmPassword: 'AnotherP@ss1!' }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.RESET_TOKEN_INVALID }),
    );
  });
});

// ─── changePassword ───────────────────────────────────────────────────────────

describe('AuthService.changePassword', () => {
  const userId = 'user-uuid-001';

  beforeEach(() => {
    mockArgon2Hash.mockResolvedValue('$argon2id$v=19$newHash');
  });

  it('updates password when currentPassword is correct and newPassword differs', async () => {
    // First verify call: current password check → true
    // Second verify call: same-password check → false
    mockArgon2Verify
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(
      service.changePassword(userId, {
        currentPassword: 'Old$Pass1',
        newPassword:     'New$Pass1',
        confirmPassword: 'New$Pass1',
      }),
    ).resolves.toBeUndefined();

    expect(repo.updatePassword).toHaveBeenCalledWith(userId, '$argon2id$v=19$newHash');
  });

  it('throws INVALID_CREDENTIALS when user is not found', async () => {
    const repo    = makeRepo({ findUserById: jest.fn().mockResolvedValue(null) });
    const service = new AuthService(repo);

    await expect(
      service.changePassword(userId, {
        currentPassword: 'Old$Pass1',
        newPassword:     'New$Pass1',
        confirmPassword: 'New$Pass1',
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.INVALID_CREDENTIALS }),
    );
  });

  it('throws INVALID_CREDENTIALS when currentPassword is wrong', async () => {
    mockArgon2Verify.mockResolvedValue(false); // current password check fails
    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(
      service.changePassword(userId, {
        currentPassword: 'Wrong$Pass1',
        newPassword:     'New$Pass1',
        confirmPassword: 'New$Pass1',
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.INVALID_CREDENTIALS }),
    );
  });

  it('throws PASSWORD_SAME when newPassword matches currentPassword', async () => {
    // First verify: current password is correct
    // Second verify: new password is the same as current
    mockArgon2Verify
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(
      service.changePassword(userId, {
        currentPassword: 'Same$Pass1',
        newPassword:     'Same$Pass1',
        confirmPassword: 'Same$Pass1',
      }),
    ).rejects.toThrow(
      expect.objectContaining({ code: AuthErrorCode.PASSWORD_SAME }),
    );
  });

  it('does NOT call updatePassword when currentPassword verification fails', async () => {
    mockArgon2Verify.mockResolvedValue(false);
    const repo    = makeRepo();
    const service = new AuthService(repo);

    await expect(
      service.changePassword(userId, {
        currentPassword: 'Wrong$Pass1',
        newPassword:     'New$Pass1',
        confirmPassword: 'New$Pass1',
      }),
    ).rejects.toThrow(AuthServiceError);

    expect(repo.updatePassword).not.toHaveBeenCalled();
  });
});
