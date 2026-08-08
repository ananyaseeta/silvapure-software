/**
 * Authenticate Middleware
 *
 * Verifies the Bearer access token on every protected route.
 * On success, attaches `req.user` (AuthUser) and calls next().
 * On failure, responds with 401 — never calls next(error) for auth failures
 * so upstream error handlers don't accidentally expose internal details.
 *
 * Does NOT perform RBAC checks — that is a separate concern.
 *
 * Token source: Authorization header only.
 *   Format: "Bearer <accessToken>"
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AuthTokenError } from '../utils/jwt';
import { prisma } from '../../../config/prisma';
import { AuthRepository } from '../repositories/auth.repository';
import { UserStatus } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/auth.types';
import { AuthErrorCode } from '../types/auth.types';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code:    AuthErrorCode.TOKEN_MISSING,
        message: 'Authorization header with Bearer token is required',
      },
    });
    return;
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    if (err instanceof AuthTokenError) {
      res.status(401).json({
        success: false,
        error: {
          code:    err.code,
          message: err.message,
        },
      });
      return;
    }
    // Unexpected error — pass to global error handler
    next(err);
    return;
  }

  // Re-validate user still exists and is active on each request.
  // This allows immediate effect of account suspension without waiting
  // for the access token to expire.
  const repo = new AuthRepository(prisma);
  const user = await repo.findUserById(payload.sub);

  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code:    AuthErrorCode.TOKEN_INVALID,
        message: 'User associated with this token no longer exists',
      },
    });
    return;
  }

  if (user.status !== UserStatus.ACTIVE) {
    res.status(403).json({
      success: false,
      error: {
        code:    AuthErrorCode.ACCOUNT_INACTIVE,
        message: 'Account is inactive or suspended',
      },
    });
    return;
  }

  (req as AuthenticatedRequest).user = {
    id:             user.id,
    email:          user.email,
    organizationId: user.organizationId,
    status:         user.status,
  };

  next();
}
