/**
 * Permission Constants
 *
 * Source of truth: prisma/seed/data/permissions.ts (RBAC Specification v1).
 *
 * These constants mirror the exact `code` values in the permission seed data.
 * They are typed as `const` strings so callers get literal-type safety when
 * composing permission checks.
 *
 * Rules:
 *   - Never rename a constant — it is the stable business key.
 *   - Never invent a permission not present in the RBAC spec.
 *   - Keep groups in the same order as the seed file for easy auditing.
 */

// ─── Authentication ───────────────────────────────────────────────────────────

export const PERM_AUTH_LOGIN           = 'auth.login'           as const;
export const PERM_AUTH_LOGOUT          = 'auth.logout'          as const;
export const PERM_AUTH_REFRESH         = 'auth.refresh'         as const;
export const PERM_AUTH_CHANGE_PASSWORD = 'auth.change_password' as const;

// ─── User Management ─────────────────────────────────────────────────────────

export const PERM_USER_READ        = 'user.read'        as const;
export const PERM_USER_CREATE      = 'user.create'      as const;
export const PERM_USER_UPDATE      = 'user.update'      as const;
export const PERM_USER_DELETE      = 'user.delete'      as const;
export const PERM_USER_ASSIGN_ROLE = 'user.assign_role' as const;
export const PERM_USER_INVITE      = 'user.invite'      as const;
export const PERM_USER_ACTIVATE    = 'user.activate'    as const;
export const PERM_USER_DEACTIVATE  = 'user.deactivate'  as const;

// ─── Organization ─────────────────────────────────────────────────────────────

export const PERM_ORGANIZATION_READ         = 'organization.read'         as const;
export const PERM_ORGANIZATION_CREATE       = 'organization.create'       as const;
export const PERM_ORGANIZATION_UPDATE       = 'organization.update'       as const;
export const PERM_ORGANIZATION_DELETE       = 'organization.delete'       as const;
export const PERM_ORGANIZATION_SETTINGS     = 'organization.settings'     as const;
export const PERM_ORGANIZATION_SUBSCRIPTION = 'organization.subscription' as const;

// ─── Plant Management ────────────────────────────────────────────────────────

export const PERM_PLANT_READ         = 'plant.read'         as const;
export const PERM_PLANT_CREATE       = 'plant.create'       as const;
export const PERM_PLANT_UPDATE       = 'plant.update'       as const;
export const PERM_PLANT_DELETE       = 'plant.delete'       as const;
export const PERM_PLANT_ASSIGN_USERS = 'plant.assign_users' as const;

// ─── Treatment Plants ────────────────────────────────────────────────────────

export const PERM_TREATMENT_PLANT_READ   = 'treatment_plant.read'   as const;
export const PERM_TREATMENT_PLANT_CREATE = 'treatment_plant.create' as const;
export const PERM_TREATMENT_PLANT_UPDATE = 'treatment_plant.update' as const;
export const PERM_TREATMENT_PLANT_DELETE = 'treatment_plant.delete' as const;

// ─── Controllers ─────────────────────────────────────────────────────────────

export const PERM_CONTROLLER_READ   = 'controller.read'   as const;
export const PERM_CONTROLLER_CREATE = 'controller.create' as const;
export const PERM_CONTROLLER_UPDATE = 'controller.update' as const;
export const PERM_CONTROLLER_DELETE = 'controller.delete' as const;

// ─── Devices ─────────────────────────────────────────────────────────────────

export const PERM_DEVICE_READ      = 'device.read'      as const;
export const PERM_DEVICE_CREATE    = 'device.create'    as const;
export const PERM_DEVICE_UPDATE    = 'device.update'    as const;
export const PERM_DEVICE_DELETE    = 'device.delete'    as const;
export const PERM_DEVICE_CONFIGURE = 'device.configure' as const;
export const PERM_DEVICE_FIRMWARE  = 'device.firmware'  as const;

// ─── Sensors ─────────────────────────────────────────────────────────────────

export const PERM_SENSOR_READ      = 'sensor.read'      as const;
export const PERM_SENSOR_CREATE    = 'sensor.create'    as const;
export const PERM_SENSOR_UPDATE    = 'sensor.update'    as const;
export const PERM_SENSOR_DELETE    = 'sensor.delete'    as const;
export const PERM_SENSOR_CALIBRATE = 'sensor.calibrate' as const;

// ─── Telemetry ────────────────────────────────────────────────────────────────

export const PERM_TELEMETRY_READ   = 'telemetry.read'   as const;
export const PERM_TELEMETRY_EXPORT = 'telemetry.export' as const;
export const PERM_TELEMETRY_IMPORT = 'telemetry.import' as const;

// ─── Alerts ──────────────────────────────────────────────────────────────────

export const PERM_ALERT_READ        = 'alert.read'        as const;
export const PERM_ALERT_ACKNOWLEDGE = 'alert.acknowledge' as const;
export const PERM_ALERT_RESOLVE     = 'alert.resolve'     as const;
export const PERM_ALERT_ASSIGN      = 'alert.assign'      as const;

// ─── Maintenance ─────────────────────────────────────────────────────────────

export const PERM_MAINTENANCE_READ     = 'maintenance.read'     as const;
export const PERM_MAINTENANCE_CREATE   = 'maintenance.create'   as const;
export const PERM_MAINTENANCE_UPDATE   = 'maintenance.update'   as const;
export const PERM_MAINTENANCE_COMPLETE = 'maintenance.complete' as const;
export const PERM_MAINTENANCE_DELETE   = 'maintenance.delete'   as const;

// ─── Compliance ──────────────────────────────────────────────────────────────

export const PERM_COMPLIANCE_READ    = 'compliance.read'    as const;
export const PERM_COMPLIANCE_CREATE  = 'compliance.create'  as const;
export const PERM_COMPLIANCE_UPDATE  = 'compliance.update'  as const;
export const PERM_COMPLIANCE_APPROVE = 'compliance.approve' as const;
export const PERM_COMPLIANCE_EXPORT  = 'compliance.export'  as const;

// ─── Reports ─────────────────────────────────────────────────────────────────

export const PERM_REPORT_READ     = 'report.read'     as const;
export const PERM_REPORT_GENERATE = 'report.generate' as const;
export const PERM_REPORT_EXPORT   = 'report.export'   as const;
export const PERM_REPORT_SCHEDULE = 'report.schedule' as const;
export const PERM_REPORT_DELETE   = 'report.delete'   as const;

// ─── Digital Wastewater Passport ─────────────────────────────────────────────

export const PERM_PASSPORT_READ     = 'passport.read'     as const;
export const PERM_PASSPORT_GENERATE = 'passport.generate' as const;
export const PERM_PASSPORT_APPROVE  = 'passport.approve'  as const;
export const PERM_PASSPORT_EXPORT   = 'passport.export'   as const;

// ─── AI ──────────────────────────────────────────────────────────────────────

export const PERM_AI_READ                   = 'ai.read'                   as const;
export const PERM_AI_PREDICT                = 'ai.predict'                as const;
export const PERM_AI_CONFIGURE              = 'ai.configure'              as const;
export const PERM_AI_TRAIN                  = 'ai.train'                  as const;
export const PERM_AI_DEPLOY                 = 'ai.deploy'                 as const;
export const PERM_AI_ROLLBACK               = 'ai.rollback'               as const;
export const PERM_AI_APPROVE_RECOMMENDATION = 'ai.approve_recommendation' as const;
export const PERM_AI_FEEDBACK               = 'ai.feedback'               as const;

// ─── Business Rules ──────────────────────────────────────────────────────────

export const PERM_RULE_READ   = 'rule.read'   as const;
export const PERM_RULE_CREATE = 'rule.create' as const;
export const PERM_RULE_UPDATE = 'rule.update' as const;
export const PERM_RULE_DELETE = 'rule.delete' as const;

// ─── Notifications ───────────────────────────────────────────────────────────

export const PERM_NOTIFICATION_READ      = 'notification.read'      as const;
export const PERM_NOTIFICATION_SEND      = 'notification.send'      as const;
export const PERM_NOTIFICATION_CONFIGURE = 'notification.configure' as const;

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const PERM_AUDIT_READ   = 'audit.read'   as const;
export const PERM_AUDIT_EXPORT = 'audit.export' as const;

// ─── Commercial & Licensing ──────────────────────────────────────────────────

export const PERM_SUBSCRIPTION_READ   = 'subscription.read'   as const;
export const PERM_SUBSCRIPTION_UPDATE = 'subscription.update' as const;
export const PERM_MODULE_READ         = 'module.read'         as const;
export const PERM_MODULE_UPDATE       = 'module.update'       as const;
export const PERM_PLAN_READ           = 'plan.read'           as const;
export const PERM_PLAN_UPDATE         = 'plan.update'         as const;

// ─── Union type of all permission codes ──────────────────────────────────────

/** Discriminated union of every known permission code string literal. */
export type PermissionCode =
  | typeof PERM_AUTH_LOGIN
  | typeof PERM_AUTH_LOGOUT
  | typeof PERM_AUTH_REFRESH
  | typeof PERM_AUTH_CHANGE_PASSWORD
  | typeof PERM_USER_READ
  | typeof PERM_USER_CREATE
  | typeof PERM_USER_UPDATE
  | typeof PERM_USER_DELETE
  | typeof PERM_USER_ASSIGN_ROLE
  | typeof PERM_USER_INVITE
  | typeof PERM_USER_ACTIVATE
  | typeof PERM_USER_DEACTIVATE
  | typeof PERM_ORGANIZATION_READ
  | typeof PERM_ORGANIZATION_CREATE
  | typeof PERM_ORGANIZATION_UPDATE
  | typeof PERM_ORGANIZATION_DELETE
  | typeof PERM_ORGANIZATION_SETTINGS
  | typeof PERM_ORGANIZATION_SUBSCRIPTION
  | typeof PERM_PLANT_READ
  | typeof PERM_PLANT_CREATE
  | typeof PERM_PLANT_UPDATE
  | typeof PERM_PLANT_DELETE
  | typeof PERM_PLANT_ASSIGN_USERS
  | typeof PERM_TREATMENT_PLANT_READ
  | typeof PERM_TREATMENT_PLANT_CREATE
  | typeof PERM_TREATMENT_PLANT_UPDATE
  | typeof PERM_TREATMENT_PLANT_DELETE
  | typeof PERM_CONTROLLER_READ
  | typeof PERM_CONTROLLER_CREATE
  | typeof PERM_CONTROLLER_UPDATE
  | typeof PERM_CONTROLLER_DELETE
  | typeof PERM_DEVICE_READ
  | typeof PERM_DEVICE_CREATE
  | typeof PERM_DEVICE_UPDATE
  | typeof PERM_DEVICE_DELETE
  | typeof PERM_DEVICE_CONFIGURE
  | typeof PERM_DEVICE_FIRMWARE
  | typeof PERM_SENSOR_READ
  | typeof PERM_SENSOR_CREATE
  | typeof PERM_SENSOR_UPDATE
  | typeof PERM_SENSOR_DELETE
  | typeof PERM_SENSOR_CALIBRATE
  | typeof PERM_TELEMETRY_READ
  | typeof PERM_TELEMETRY_EXPORT
  | typeof PERM_TELEMETRY_IMPORT
  | typeof PERM_ALERT_READ
  | typeof PERM_ALERT_ACKNOWLEDGE
  | typeof PERM_ALERT_RESOLVE
  | typeof PERM_ALERT_ASSIGN
  | typeof PERM_MAINTENANCE_READ
  | typeof PERM_MAINTENANCE_CREATE
  | typeof PERM_MAINTENANCE_UPDATE
  | typeof PERM_MAINTENANCE_COMPLETE
  | typeof PERM_MAINTENANCE_DELETE
  | typeof PERM_COMPLIANCE_READ
  | typeof PERM_COMPLIANCE_CREATE
  | typeof PERM_COMPLIANCE_UPDATE
  | typeof PERM_COMPLIANCE_APPROVE
  | typeof PERM_COMPLIANCE_EXPORT
  | typeof PERM_REPORT_READ
  | typeof PERM_REPORT_GENERATE
  | typeof PERM_REPORT_EXPORT
  | typeof PERM_REPORT_SCHEDULE
  | typeof PERM_REPORT_DELETE
  | typeof PERM_PASSPORT_READ
  | typeof PERM_PASSPORT_GENERATE
  | typeof PERM_PASSPORT_APPROVE
  | typeof PERM_PASSPORT_EXPORT
  | typeof PERM_AI_READ
  | typeof PERM_AI_PREDICT
  | typeof PERM_AI_CONFIGURE
  | typeof PERM_AI_TRAIN
  | typeof PERM_AI_DEPLOY
  | typeof PERM_AI_ROLLBACK
  | typeof PERM_AI_APPROVE_RECOMMENDATION
  | typeof PERM_AI_FEEDBACK
  | typeof PERM_RULE_READ
  | typeof PERM_RULE_CREATE
  | typeof PERM_RULE_UPDATE
  | typeof PERM_RULE_DELETE
  | typeof PERM_NOTIFICATION_READ
  | typeof PERM_NOTIFICATION_SEND
  | typeof PERM_NOTIFICATION_CONFIGURE
  | typeof PERM_AUDIT_READ
  | typeof PERM_AUDIT_EXPORT
  | typeof PERM_SUBSCRIPTION_READ
  | typeof PERM_SUBSCRIPTION_UPDATE
  | typeof PERM_MODULE_READ
  | typeof PERM_MODULE_UPDATE
  | typeof PERM_PLAN_READ
  | typeof PERM_PLAN_UPDATE;
