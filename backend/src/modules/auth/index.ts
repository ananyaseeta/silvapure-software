/**
 * Auth Module Barrel
 *
 * Exports the public surface of the auth module.
 * Internal implementation files (repository, service internals) are
 * not re-exported — consumers use only what they need.
 */

export { authRouter } from './routes/auth.routes';
export { authenticate } from './middleware/authenticate.middleware';
export { AuthService, AuthServiceError } from './services/auth.service';
export { AuthRepository } from './repositories/auth.repository';
export { hashPassword, verifyPassword } from './utils/hash';
export {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  AuthTokenError,
} from './utils/jwt';
export type {
  AuthUser,
  AuthUserRecord,
  AuthenticatedRequest,
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
  LoginResult,
  RefreshResult,
  ForgotPasswordResult,
} from './types/auth.types';
export { AuthErrorCode } from './types/auth.types';
