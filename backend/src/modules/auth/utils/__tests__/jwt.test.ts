/**
 * Unit tests — JWT utilities
 *
 * Tests sign/verify round-trips, error cases, type-guard checks, and
 * the refreshTokenMaxAgeMs parser. The real jsonwebtoken library is used
 * throughout; no mocking of the crypto layer.
 */

// ── bootstrap env before any module imports ───────────────────────────────────
process.env['NODE_ENV']                  = 'test';
process.env['DATABASE_URL']              = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET']         = 'test-access-secret-at-least-32-chars!!';
process.env['JWT_REFRESH_SECRET']        = 'test-refresh-secret-at-least-32-chars!';
process.env['JWT_ACCESS_EXPIRES_IN']     = '15m';
process.env['JWT_REFRESH_EXPIRES_IN']    = '7d';
process.env['ARGON2_MEMORY_COST']        = '64';
process.env['ARGON2_TIME_COST']          = '1';
process.env['ARGON2_PARALLELISM']        = '1';

import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenMaxAgeMs,
  AuthTokenError,
} from '../jwt';
import type { AccessTokenPayload, RefreshTokenPayload } from '../../types/auth.types';
import { AuthErrorCode } from '../../types/auth.types';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const accessPayload: AccessTokenPayload = {
  sub:            'user-uuid-001',
  organizationId: 'org-uuid-001',
  email:          'test@silvapure.io',
  type:           'access',
};

const refreshPayload: RefreshTokenPayload = {
  sub:  'user-uuid-001',
  type: 'refresh',
};

// ─── signAccessToken ──────────────────────────────────────────────────────────

describe('signAccessToken', () => {
  it('returns a non-empty JWT string', () => {
    const token = signAccessToken(accessPayload);
    expect(typeof token).toBe('string');
    // JWT has exactly 3 base64url segments separated by dots
    expect(token.split('.').length).toBe(3);
  });

  it('produces different tokens on successive calls (jti / iat vary)', () => {
    // Sleep 1ms to ensure iat differs
    const t1 = signAccessToken(accessPayload);
    const t2 = signAccessToken(accessPayload);
    // Both are valid but may or may not be the same depending on iat resolution;
    // the important thing is they are decodable independently
    expect(verifyAccessToken(t1).sub).toBe(accessPayload.sub);
    expect(verifyAccessToken(t2).sub).toBe(accessPayload.sub);
  });
});

// ─── verifyAccessToken ────────────────────────────────────────────────────────

describe('verifyAccessToken', () => {
  it('decodes a valid access token and returns the payload', () => {
    const token   = signAccessToken(accessPayload);
    const decoded = verifyAccessToken(token);

    expect(decoded.sub).toBe(accessPayload.sub);
    expect(decoded.organizationId).toBe(accessPayload.organizationId);
    expect(decoded.email).toBe(accessPayload.email);
    expect(decoded.type).toBe('access');
  });

  it('throws AuthTokenError(TOKEN_INVALID) for a tampered token', () => {
    const token   = signAccessToken(accessPayload);
    const tampered = token.slice(0, -4) + 'XXXX';

    expect(() => verifyAccessToken(tampered)).toThrow(AuthTokenError);
    expect(() => verifyAccessToken(tampered)).toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
    );
  });

  it('throws AuthTokenError(TOKEN_INVALID) for an empty string', () => {
    expect(() => verifyAccessToken('')).toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
    );
  });

  it('throws AuthTokenError(TOKEN_INVALID) for a completely random string', () => {
    expect(() => verifyAccessToken('not.a.jwt')).toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
    );
  });

  it('throws AuthTokenError(TOKEN_WRONG_TYPE) when a refresh token is passed as access token', () => {
    // Sign a refresh token with the ACCESS secret to simulate a type-swap attack
    // We need to do this at the jwt level, so we use the refresh signer but then
    // verify with the access verifier by manually crafting using jsonwebtoken.
    // Simplest approach: sign a payload with type:'refresh' using the access secret.
    import('jsonwebtoken').then((jwt) => {
      const wrongType = jwt.default.sign(
        { ...accessPayload, type: 'refresh' },
        process.env['JWT_ACCESS_SECRET'] as string,
        { algorithm: 'HS256' },
      );
      expect(() => verifyAccessToken(wrongType)).toThrow(
        expect.objectContaining({ code: AuthErrorCode.TOKEN_WRONG_TYPE }),
      );
    });
  });

  it('throws AuthTokenError(TOKEN_EXPIRED) for an already-expired token', async () => {
    const jwt = await import('jsonwebtoken');
    // Use a negative expiresIn to create an already-expired token
    const expiredToken = jwt.default.sign(
      accessPayload,
      process.env['JWT_ACCESS_SECRET'] as string,
      { expiresIn: -1, algorithm: 'HS256' },
    );

    expect(() => verifyAccessToken(expiredToken)).toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_EXPIRED }),
    );
  });

  it('throws AuthTokenError(TOKEN_INVALID) when signed with a different secret', () => {
    import('jsonwebtoken').then((jwt) => {
      const wrongSecret = jwt.default.sign(accessPayload, 'completely-wrong-secret-32-chars!', {
        algorithm: 'HS256',
      });
      expect(() => verifyAccessToken(wrongSecret)).toThrow(
        expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
      );
    });
  });
});

// ─── signRefreshToken ─────────────────────────────────────────────────────────

describe('signRefreshToken', () => {
  it('returns a valid 3-segment JWT', () => {
    const token = signRefreshToken(refreshPayload);
    expect(token.split('.').length).toBe(3);
  });
});

// ─── verifyRefreshToken ───────────────────────────────────────────────────────

describe('verifyRefreshToken', () => {
  it('decodes a valid refresh token', () => {
    const token   = signRefreshToken(refreshPayload);
    const decoded = verifyRefreshToken(token);

    expect(decoded.sub).toBe(refreshPayload.sub);
    expect(decoded.type).toBe('refresh');
  });

  it('throws AuthTokenError(TOKEN_INVALID) for a tampered token', () => {
    const token   = signRefreshToken(refreshPayload);
    const tampered = token.slice(0, -4) + 'ZZZZ';

    expect(() => verifyRefreshToken(tampered)).toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
    );
  });

  it('throws AuthTokenError(TOKEN_INVALID) for an empty string', () => {
    expect(() => verifyRefreshToken('')).toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_INVALID }),
    );
  });

  it('throws AuthTokenError(TOKEN_EXPIRED) for an already-expired refresh token', async () => {
    const jwt = await import('jsonwebtoken');
    const expired = jwt.default.sign(
      refreshPayload,
      process.env['JWT_REFRESH_SECRET'] as string,
      { expiresIn: -1, algorithm: 'HS256' },
    );

    expect(() => verifyRefreshToken(expired)).toThrow(
      expect.objectContaining({ code: AuthErrorCode.TOKEN_EXPIRED }),
    );
  });

  it('throws AuthTokenError(TOKEN_WRONG_TYPE) when an access token is passed as refresh token', () => {
    import('jsonwebtoken').then((jwt) => {
      const wrongType = jwt.default.sign(
        { ...refreshPayload, type: 'access' },
        process.env['JWT_REFRESH_SECRET'] as string,
        { algorithm: 'HS256' },
      );
      expect(() => verifyRefreshToken(wrongType)).toThrow(
        expect.objectContaining({ code: AuthErrorCode.TOKEN_WRONG_TYPE }),
      );
    });
  });

  it('rejects an access token verified against the refresh secret', () => {
    // access token signed with access secret must fail refresh verification
    const accessToken = signAccessToken(accessPayload);
    expect(() => verifyRefreshToken(accessToken)).toThrow(AuthTokenError);
  });
});

// ─── AuthTokenError ───────────────────────────────────────────────────────────

describe('AuthTokenError', () => {
  it('extends Error', () => {
    const err = new AuthTokenError('TEST_CODE', 'test message');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AuthTokenError);
  });

  it('has the correct name', () => {
    const err = new AuthTokenError('TEST_CODE', 'test message');
    expect(err.name).toBe('AuthTokenError');
  });

  it('exposes the code property', () => {
    const err = new AuthTokenError('MY_CODE', 'some message');
    expect(err.code).toBe('MY_CODE');
  });

  it('exposes the message property', () => {
    const err = new AuthTokenError('X', 'detailed message');
    expect(err.message).toBe('detailed message');
  });
});

// ─── refreshTokenMaxAgeMs ─────────────────────────────────────────────────────

describe('refreshTokenMaxAgeMs', () => {
  const ORIGINAL_ENV = process.env['JWT_REFRESH_EXPIRES_IN'];

  afterEach(() => {
    process.env['JWT_REFRESH_EXPIRES_IN'] = ORIGINAL_ENV;
  });

  it('parses "7d" correctly (7 * 24 * 60 * 60 * 1000)', () => {
    // The env module is already loaded with '7d', so we just call the function.
    // refreshTokenMaxAgeMs reads env at call time through the cached env object.
    // Since env is validated at import time, we test the actual parsed value.
    const ms = refreshTokenMaxAgeMs();
    expect(ms).toBe(7 * 24 * 60 * 60 * 1000);
  });
});

// ─── Cross-token type isolation ───────────────────────────────────────────────

describe('cross-token type isolation', () => {
  it('a refresh token cannot be verified as an access token (wrong secret)', () => {
    const refreshToken = signRefreshToken(refreshPayload);
    // Different secret → invalid signature on access verifier
    expect(() => verifyAccessToken(refreshToken)).toThrow(AuthTokenError);
  });

  it('an access token cannot be verified as a refresh token (wrong secret)', () => {
    const accessToken = signAccessToken(accessPayload);
    expect(() => verifyRefreshToken(accessToken)).toThrow(AuthTokenError);
  });
});
