/**
 * Authorization Domain Error
 *
 * Thrown by the authorize middleware and permission helpers when a user
 * lacks the required permission or role.
 *
 * The global error handler in app.ts catches this and returns a 403 response.
 * statusHint is always 403 — it is carried on the error so the handler does
 * not need to hard-code HTTP status codes.
 */

import type { AuthorizationErrorCode } from '../types/authorization.types';

export class AuthorizationError extends Error {
  public readonly code:       AuthorizationErrorCode;
  public readonly statusHint: 403;

  constructor(code: AuthorizationErrorCode, message: string) {
    super(message);
    this.name       = 'AuthorizationError';
    this.code       = code;
    this.statusHint = 403;
  }
}
