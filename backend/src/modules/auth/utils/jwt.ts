import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from '../types/auth.types';
import { AuthErrorCode } from '../types/auth.types';

export class AuthTokenError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthTokenError';
    this.code = code;
  }
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const expiresIn = (env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'] & string;
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    }) as AccessTokenPayload;

    if (decoded.type !== 'access') {
      throw new AuthTokenError(AuthErrorCode.TOKEN_WRONG_TYPE, 'Token is not an access token');
    }

    return decoded;
  } catch (err) {
    if (err instanceof AuthTokenError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthTokenError(AuthErrorCode.TOKEN_EXPIRED, 'Access token has expired');
    }
    throw new AuthTokenError(AuthErrorCode.TOKEN_INVALID, 'Access token is invalid');
  }
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const expiresIn = (env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] & string;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    }) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') {
      throw new AuthTokenError(AuthErrorCode.TOKEN_WRONG_TYPE, 'Token is not a refresh token');
    }

    return decoded;
  } catch (err) {
    if (err instanceof AuthTokenError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw new AuthTokenError(AuthErrorCode.TOKEN_EXPIRED, 'Refresh token has expired');
    }
    throw new AuthTokenError(AuthErrorCode.TOKEN_INVALID, 'Refresh token is invalid');
  }
}

export function refreshTokenMaxAgeMs(): number {
  const raw = env.JWT_REFRESH_EXPIRES_IN;
  const match = /^(\d+)([smhd])$/.exec(raw);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const [, value, unit] = match;
  const n = parseInt(value as string, 10);
  const multipliers: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return n * (multipliers[unit as string] ?? 86_400_000);
}
