/**
 * Auth Controller
 *
 * Owns HTTP concerns only: parsing requests, setting cookies, shaping responses.
 * No business logic — delegates everything to AuthService.
 *
 * Cookie strategy:
 *   Refresh tokens are stored in an httpOnly, Secure, SameSite cookie named
 *   `silvapure_refresh`. They are never returned in the response body.
 *   The access token IS returned in the response body for use in Authorization
 *   headers on subsequent requests.
 */

import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRepository } from '../repositories/auth.repository';
import { prisma } from '../../../config/prisma';
import { env } from '../../../config/env';
import { refreshTokenMaxAgeMs } from '../utils/jwt';
import { loginSchema } from '../dto/login.dto';
import { changePasswordSchema } from '../dto/changePassword.dto';
import { forgotPasswordSchema } from '../dto/forgotPassword.dto';
import { resetPasswordSchema } from '../dto/resetPassword.dto';
import type { AuthenticatedRequest } from '../types/auth.types';

const REFRESH_COOKIE_NAME = 'silvapure_refresh';

function getService(): AuthService {
  return new AuthService(new AuthRepository(prisma));
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure:   env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge:   refreshTokenMaxAgeMs(),
    path:     '/api/auth',
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto    = loginSchema.parse(req.body);
    const result = await getService().login(dto);

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: {
          id:             result.user.id,
          email:          result.user.email,
          firstName:      result.user.firstName,
          lastName:       result.user.lastName,
          organizationId: result.user.organizationId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Refresh ──────────────────────────────────────────────────────────────────

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code:    'AUTH_REFRESH_TOKEN_MISSING',
          message: 'Refresh token cookie is missing',
        },
      });
      return;
    }

    const result = await getService().refresh(token);

    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: { accessToken: result.accessToken },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    getService().logout();
    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      data:    { message: 'Logged out successfully' },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = forgotPasswordSchema.parse(req.body);
    await getService().forgotPassword(dto);

    // Always return 200 regardless of outcome — prevents email enumeration.
    res.status(200).json({
      success: true,
      data: {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = resetPasswordSchema.parse(req.body);
    await getService().resetPassword(dto);

    res.status(200).json({
      success: true,
      data: { message: 'Password has been reset successfully.' },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authedReq = req as AuthenticatedRequest;
    const dto       = changePasswordSchema.parse(req.body);

    await getService().changePassword(authedReq.user.id, dto);

    // Rotate refresh token — force re-login after password change
    clearRefreshCookie(res);

    res.status(200).json({
      success: true,
      data: {
        message:
          'Password changed successfully. Please log in again with your new password.',
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Me ───────────────────────────────────────────────────────────────────────

export function me(req: Request, res: Response): void {
  const authedReq = req as AuthenticatedRequest;
  res.status(200).json({
    success: true,
    data: { user: authedReq.user },
  });
}
