import type { Request, Response, NextFunction } from 'express';
import { idParamSchema } from './validation';
import { orgScopeService } from './scope.service';
import { AuthorizationError } from '../authorization/errors/authorization.error';
import { AuthorizationErrorCode } from '../authorization/types/authorization.types';
import type { AuthenticatedRequest } from '../auth/types/auth.types';

/**
 * requireOrgScope
 *
 * Row-level organization access guard for routes that include an `:id` param
 * pointing to an organization resource.
 *
 * Must run AFTER:
 *   1. authenticate   — so req.user is populated
 *   2. requirePermission — so the RBAC permission check already passed
 *
 * Behaviour:
 *   - Validates :id is a UUID (reuses the existing idParamSchema).
 *   - Passes if requester is ADMIN (cross-org access granted by RBAC spec).
 *   - Passes if organization ID matches req.user.organizationId.
 *   - Calls next(AuthorizationError) with AUTHZ_FORBIDDEN otherwise.
 *   - Calls next(err) for unexpected errors so the global handler shapes them.
 */
export async function requireOrgScope(
  req:  Request,
  res:  Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authedReq = req as AuthenticatedRequest;

    if (!authedReq.user?.id) {
      return next(
        new AuthorizationError(
          AuthorizationErrorCode.USER_NOT_ATTACHED,
          'Authentication middleware must run before organization scope guard',
        ),
      );
    }

    const parseResult = idParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      // Let the downstream handler deal with invalid UUIDs
      return next();
    }

    const { id: organizationId } = parseResult.data;

    const allowed = await orgScopeService.canAccess(authedReq.user, organizationId);

    if (!allowed) {
      return next(
        new AuthorizationError(
          AuthorizationErrorCode.FORBIDDEN,
          'You do not have access to this organization',
        ),
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
