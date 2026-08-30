import type { Request } from 'express';
import type { UserStatus } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string;
  organizationId: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  iat?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
  status: UserStatus;
}

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  status: UserStatus;
  firstName: string;
  lastName: string | null;
}

export interface LoginResult {
  accessToken: string;
  user: Omit<AuthUserRecord, 'passwordHash'>;
}

export interface RefreshResult {
  accessToken: string;
}

export interface ForgotPasswordResult {
  resetToken: string;
  expiresAt: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

export const AuthErrorCode = {
  INVALID_CREDENTIALS:   'AUTH_INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE:      'AUTH_ACCOUNT_INACTIVE',
  TOKEN_MISSING:         'AUTH_TOKEN_MISSING',
  TOKEN_INVALID:         'AUTH_TOKEN_INVALID',
  TOKEN_EXPIRED:         'AUTH_TOKEN_EXPIRED',
  TOKEN_WRONG_TYPE:      'AUTH_TOKEN_WRONG_TYPE',
  REFRESH_TOKEN_MISSING: 'AUTH_REFRESH_TOKEN_MISSING',
  PASSWORD_SAME:         'AUTH_PASSWORD_SAME',
  RESET_TOKEN_INVALID:   'AUTH_RESET_TOKEN_INVALID',
  RESET_TOKEN_EXPIRED:   'AUTH_RESET_TOKEN_EXPIRED',
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];
