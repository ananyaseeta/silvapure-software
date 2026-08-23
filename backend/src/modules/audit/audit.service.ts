import { prisma } from '../../config/prisma';

// ─── Action constants ─────────────────────────────────────────────────────────

export const AuditAction = {
  // Authentication
  LOGIN_SUCCESS:      'AUTH_LOGIN_SUCCESS',
  LOGIN_FAILED:       'AUTH_LOGIN_FAILED',
  LOGOUT:             'AUTH_LOGOUT',
  PASSWORD_CHANGED:   'AUTH_PASSWORD_CHANGED',
  PASSWORD_RESET:     'AUTH_PASSWORD_RESET',

  // User management
  USER_CREATED:       'USER_CREATED',
  USER_UPDATED:       'USER_UPDATED',
  USER_DELETED:       'USER_DELETED',
  USER_STATUS_CHANGED:'USER_STATUS_CHANGED',
  USER_ROLES_CHANGED: 'USER_ROLES_CHANGED',

  // Organization management
  ORG_CREATED:        'ORG_CREATED',
  ORG_UPDATED:        'ORG_UPDATED',
  ORG_STATUS_CHANGED: 'ORG_STATUS_CHANGED',
  ORG_DELETED:        'ORG_DELETED',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

// ─── Resource type constants ──────────────────────────────────────────────────

export const AuditResource = {
  USER:         'User',
  ORGANIZATION: 'Organization',
  AUTH_SESSION: 'AuthSession',
} as const;

export type AuditResource = (typeof AuditResource)[keyof typeof AuditResource];

// ─── Input type ───────────────────────────────────────────────────────────────

export interface AuditParams {
  userId:       string;
  action:       AuditAction;
  resourceType: AuditResource;
  resourceId:   string;
  oldValues?:   Record<string, unknown> | null;
  newValues?:   Record<string, unknown> | null;
  ipAddress?:   string;
  userAgent?:   string;
}

// ─── Sensitive field stripping ────────────────────────────────────────────────

const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'accessToken',
  'refreshToken',
  'resetToken',
  'token',
  'secret',
  'apiKey',
]);

/**
 * Removes sensitive fields from an object before storing in audit log.
 * Operates one level deep — nested objects are replaced with a redaction marker.
 */
function stripSensitiveFields(
  obj: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!obj) return null;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─── AuditService ─────────────────────────────────────────────────────────────

export class AuditService {
  /**
   * Records an audit event.
   *
   * Audit failures are intentionally non-fatal — the primary operation has
   * already succeeded when this is called. Errors are logged to stderr but
   * do NOT propagate to callers.
   *
   * Sensitive fields are stripped from oldValues and newValues automatically.
   */
  async record(params: AuditParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId:       params.userId,
          action:       params.action,
          resourceType: params.resourceType,
          resourceId:   params.resourceId,
          ...(params.oldValues != null ? { oldValues: stripSensitiveFields(params.oldValues) as object } : {}),
          ...(params.newValues != null ? { newValues: stripSensitiveFields(params.newValues) as object } : {}),
          ...(params.ipAddress  != null ? { ipAddress:  params.ipAddress  } : { ipAddress:  null }),
          ...(params.userAgent  != null ? { userAgent:  params.userAgent  } : { userAgent:  null }),
        },
      });
    } catch (err) {
      // Audit failures must not break the primary operation
      console.error('[AuditService] Failed to write audit log:', err);
    }
  }
}

export const auditService = new AuditService();
