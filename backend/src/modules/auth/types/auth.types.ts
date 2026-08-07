/**
 * Auth Domain Types
 *
 * All interfaces and types used across the auth module.
 * No Prisma types are exposed directly — the service layer maps them
 * to these domain types, keeping the rest of the module Prisma-agnostic.
 */

import type { Request } from 'express';
import type { UserStatus } from '@prisma/client';

// ─── Token Payloads ───────────────────────────────────────────────────────────

/** Claims embedded in an access token. */
export interface AccessTokenPayload {
  /** Subject — User UUID */
  sub: string;
  /** Organization UUID */
  organizationId: string;
  /** User email */
  email: string;
  /** Token type discriminator */
  type: 'access';
}

/** Claims embedded in a refresh token. */
export interface RefreshTokenPayload {
  /** Subject — User UUID */
  sub: string;
  /** Token type discriminator */
  type: 'refresh';
  /** Issued-at epoch (seconds) — used as a weak replay guard */
  iat?: number;
}

// ─── Token Pair ───────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  /** Issued as httpOnly cookie — not returned in response body */
  refreshToken: string;
}

// ─── Authenticated User ───────────────────────────────────────────────────────

/** Minimal user projection attached to every authenticated request. */
export interface AuthUser {
  id: string;
  email: string;
  organizationId: string;
  status: UserStatus;
}

// ─── Repository contracts ─────────────────────────────────────────────────────

/** User projection returned by the repository for auth operations. */
export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  organizationId: string;
  status: UserStatus;
  firstName: string;
  lastName: string | null;
}

// ─── Service results ──────────────────────────────────────────────────────────

export interface LoginResult {
  accessToken: string;
  user: Omit<AuthUserRecord, 'passwordHash'>;
}

export interface RefreshResult {
  accessToken: string;
}

export interface ForgotPasswordResult {
  /**
   * Opaque token to be delivered via email.
   * The caller (email service) is responsible for delivery.
   * Never expose this token in an HTTP response.
   */
  resetToken: string;
  /** ISO timestamp when the token expires */
  expiresAt: string;
}

// ─── Augmented Express Request ────────────────────────────────────────────────

/** Express Request with a guaranteed authenticated user attached. */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// ─── Error codes ──────────────────────────────────────────────────────────────

export const AuthErrorCode = {
  INVALID_CREDENTIALS:    'AUTH_INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE:       'AUTH_ACCOUNT_INACTIVE',
  TOKEN_MISSING:          'AUTH_TOKEN_MISSING',
  TOKEN_INVALID:          'AUTH_TOKEN_INVALID',
  TOKEN_EXPIRED:          'AUTH_TOKEN_EXPIRED',
  TOKEN_WRONG_TYPE:       'AUTH_TOKEN_WRONG_TYPE',
  REFRESH_TOKEN_MISSING:  'AUTH_REFRESH_TOKEN_MISSING',
  PASSWORD_SAME:          'AUTH_PASSWORD_SAME',
  RESET_TOKEN_INVALID:    'AUTH_RESET_TOKEN_INVALID',
  RESET_TOKEN_EXPIRED:    'AUTH_RESET_TOKEN_EXPIRED',
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];
