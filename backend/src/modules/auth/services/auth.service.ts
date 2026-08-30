import crypto from 'crypto';
import { UserStatus } from '@prisma/client';
import { AuthRepository } from '../repositories/auth.repository';
import { hashPassword, verifyPassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken, AuthTokenError } from '../utils/jwt';
import {
  AuthErrorCode,
  type AuthUserRecord,
  type LoginResult,
  type RefreshResult,
  type ForgotPasswordResult,
} from '../types/auth.types';
import { env } from '../../../config/env';
import type { LoginDto } from '../dto/login.dto';
import type { ChangePasswordDto } from '../dto/changePassword.dto';
import type { ForgotPasswordDto } from '../dto/forgotPassword.dto';
import type { ResetPasswordDto } from '../dto/resetPassword.dto';

export class AuthServiceError extends Error {
  public readonly code: string;
  public readonly statusHint: number;

  constructor(code: string, message: string, statusHint = 401) {
    super(message);
    this.name       = 'AuthServiceError';
    this.code       = code;
    this.statusHint = statusHint;
  }
}

interface ResetEntry {
  userId:    string;
  expiresAt: Date;
}

const resetTokenStore = new Map<string, ResetEntry>();

/** Returns the userId associated with a reset token without consuming it. */
export function _getResetUserId(token: string): string | undefined {
  return resetTokenStore.get(token)?.userId;
}

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async login(dto: LoginDto): Promise<LoginResult & { refreshToken: string }> {
    const user = await this.repo.findUserByEmail(dto.email);

    // Always verify against something to avoid timing-based user enumeration
    const dummyHash = '$argon2id$v=19$m=65536,t=3,p=1$placeholder$placeholder';
    const hash = user?.passwordHash ?? dummyHash;
    const passwordValid = await verifyPassword(hash, dto.password);

    if (!user || !passwordValid) {
      throw new AuthServiceError(AuthErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthServiceError(AuthErrorCode.ACCOUNT_INACTIVE, 'Account is inactive or suspended', 403);
    }

    const tokens = this.issueTokens(user);

    return {
      accessToken:  tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id:             user.id,
        email:          user.email,
        organizationId: user.organizationId,
        status:         user.status,
        firstName:      user.firstName,
        lastName:       user.lastName,
      },
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResult & { refreshToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        throw new AuthServiceError(err.code, err.message, 401);
      }
      throw err;
    }

    const user = await this.repo.findUserById(payload.sub);

    if (!user) {
      throw new AuthServiceError(AuthErrorCode.TOKEN_INVALID, 'User no longer exists', 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AuthServiceError(AuthErrorCode.ACCOUNT_INACTIVE, 'Account is inactive or suspended', 403);
    }

    const tokens = this.issueTokens(user);
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  }

  logout(): void {
    // Stateless — caller clears the cookie. Add token family deletion here when a RefreshToken table is added.
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResult> {
    const user = await this.repo.findUserByEmail(dto.email);
    const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000);

    if (!user || user.status !== UserStatus.ACTIVE) {
      // Return a plausible result — never reveal whether the email exists
      return { resetToken: crypto.randomBytes(32).toString('hex'), expiresAt: expiresAt.toISOString() };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    resetTokenStore.set(resetToken, { userId: user.id, expiresAt });
    return { resetToken, expiresAt: expiresAt.toISOString() };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const entry = resetTokenStore.get(dto.token);

    if (!entry) {
      throw new AuthServiceError(AuthErrorCode.RESET_TOKEN_INVALID, 'Reset token is invalid', 400);
    }

    if (entry.expiresAt < new Date()) {
      resetTokenStore.delete(dto.token);
      throw new AuthServiceError(AuthErrorCode.RESET_TOKEN_EXPIRED, 'Reset token has expired', 400);
    }

    const user = await this.repo.findUserById(entry.userId);
    if (!user) {
      resetTokenStore.delete(dto.token);
      throw new AuthServiceError(AuthErrorCode.RESET_TOKEN_INVALID, 'Reset token is invalid', 400);
    }

    const isSamePassword = await verifyPassword(user.passwordHash, dto.newPassword);
    if (isSamePassword) {
      throw new AuthServiceError(AuthErrorCode.PASSWORD_SAME, 'New password must differ from the current password', 400);
    }

    const newHash = await hashPassword(dto.newPassword);
    await this.repo.updatePassword(entry.userId, newHash);
    resetTokenStore.delete(dto.token);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repo.findUserById(userId);

    if (!user) {
      throw new AuthServiceError(AuthErrorCode.INVALID_CREDENTIALS, 'User not found', 404);
    }

    const currentValid = await verifyPassword(user.passwordHash, dto.currentPassword);
    if (!currentValid) {
      throw new AuthServiceError(AuthErrorCode.INVALID_CREDENTIALS, 'Current password is incorrect', 401);
    }

    const isSame = await verifyPassword(user.passwordHash, dto.newPassword);
    if (isSame) {
      throw new AuthServiceError(AuthErrorCode.PASSWORD_SAME, 'New password must differ from the current password', 400);
    }

    const newHash = await hashPassword(dto.newPassword);
    await this.repo.updatePassword(userId, newHash);
  }

  private issueTokens(user: AuthUserRecord): { accessToken: string; refreshToken: string } {
    const accessToken  = signAccessToken({ sub: user.id, organizationId: user.organizationId, email: user.email, type: 'access' });
    const refreshToken = signRefreshToken({ sub: user.id, type: 'refresh' });
    return { accessToken, refreshToken };
  }
}
