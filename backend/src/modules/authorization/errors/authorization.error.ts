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
