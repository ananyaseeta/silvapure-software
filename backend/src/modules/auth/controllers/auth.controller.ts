import type { Request, Response, NextFunction } from 'express';
import { AuthService, AuthServiceError, _getResetUserId } from '../services/auth.service';
import { AuthRepository } from '../repositories/auth.repository';
import { prisma } from '../../../config/prisma';
import { env } from '../../../config/env';
import { refreshTokenMaxAgeMs } from '../utils/jwt';
import { loginSchema } from '../dto/login.dto';
import { changePasswordSchema } from '../dto/changePassword.dto';
import { forgotPasswordSchema } from '../dto/forgotPassword.dto';
import { resetPasswordSchema } from '../dto/resetPassword.dto';
import type { AuthenticatedRequest } from '../types/auth.types';
import { auditService, AuditAction, AuditResource } from '../../audit/audit.service';

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

function extractRequestMeta(req: Request): { ipAddress?: string; userAgent?: string } {
  const raw = (req.headers['x-forwarded-for'] as string | undefined) ?? req.socket?.remoteAddress;
  const ip  = raw?.split(',')[0]?.trim();
  return {
    ...(ip                      ? { ipAddress: ip }                               : {}),
    ...(req.headers['user-agent'] ? { userAgent: req.headers['user-agent'] } : {}),
  };
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const meta = extractRequestMeta(req);
  try {
    const dto    = loginSchema.parse(req.body);
    const result = await getService().login(dto);

    setRefreshCookie(res, result.refreshToken);

    // Fire-and-forget: login success audit
    void auditService.record({
      userId:       result.user.id,
      action:       AuditAction.LOGIN_SUCCESS,
      resourceType: AuditResource.AUTH_SESSION,
      resourceId:   result.user.id,
      newValues:    { email: result.user.email },
      ...meta,
    });

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
    // Failed login: userId is unknown, so we cannot write AuditLog (userId is required and non-nullable).
    // Log to stderr only — schema constraint prevents DB audit entry without a valid userId.
    if (err instanceof AuthServiceError) {
      console.warn('[Audit] LOGIN_FAILED — cannot create AuditLog without valid userId:', req.body?.email ?? 'unknown');
    }
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'AUTH_REFRESH_TOKEN_MISSING', message: 'Refresh token cookie is missing' },
      });
      return;
    }

    const result = await getService().refresh(token);
    setRefreshCookie(res, result.refreshToken);

    res.status(200).json({ success: true, data: { accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authedReq = req as Partial<AuthenticatedRequest>;
    getService().logout();
    clearRefreshCookie(res);

    // Fire-and-forget: logout audit (only when authenticated)
    if (authedReq.user?.id) {
      const meta = extractRequestMeta(req);
      void auditService.record({
        userId:       authedReq.user.id,
        action:       AuditAction.LOGOUT,
        resourceType: AuditResource.AUTH_SESSION,
        resourceId:   authedReq.user.id,
        ...meta,
      });
    }

    res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = forgotPasswordSchema.parse(req.body);
    await getService().forgotPassword(dto);

    // Always return 200 — prevents email enumeration
    res.status(200).json({
      success: true,
      data: { message: 'If an account with that email exists, a password reset link has been sent.' },
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = resetPasswordSchema.parse(req.body);
    const userId = _getResetUserId(dto.token);

    await getService().resetPassword(dto);

    if (userId) {
      const m = extractRequestMeta(req);
      void auditService.record({
        userId,
        action:       AuditAction.PASSWORD_RESET,
        resourceType: AuditResource.USER,
        resourceId:   userId,
        ...m,
      });
    }

    res.status(200).json({ success: true, data: { message: 'Password has been reset successfully.' } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authedReq = req as AuthenticatedRequest;
    const dto       = changePasswordSchema.parse(req.body);

    await getService().changePassword(authedReq.user.id, dto);

    // Force re-login after password change
    clearRefreshCookie(res);

    // Fire-and-forget: password change audit
    const meta = extractRequestMeta(req);
    void auditService.record({
      userId:       authedReq.user.id,
      action:       AuditAction.PASSWORD_CHANGED,
      resourceType: AuditResource.USER,
      resourceId:   authedReq.user.id,
      ...meta,
    });

    res.status(200).json({
      success: true,
      data: { message: 'Password changed successfully. Please log in again with your new password.' },
    });
  } catch (err) {
    next(err);
  }
}

export function me(req: Request, res: Response): void {
  const authedReq = req as AuthenticatedRequest;
  res.status(200).json({ success: true, data: { user: authedReq.user } });
}
