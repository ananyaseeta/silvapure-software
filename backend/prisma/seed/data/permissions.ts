/**
 * SILVAPURE — Permission Seed Data
 *
 * Source of truth: RBAC Specification v1.
 *
 * Every permission code in this file matches the spec exactly.
 * The `module` field is derived automatically from the permission code prefix
 * (everything before the first dot). This is the value stored in Permission.module
 * in the database and used by the API layer for category-based filtering.
 *
 * Rules:
 *   - Never rename a code. Codes are stable foreign keys in role-permission mappings.
 *   - Never invent a permission that is not in the RBAC spec.
 *   - The `name` field is a human-readable label for the admin UI.
 *   - The `module` is auto-generated — do not set it manually.
 */

export interface PermissionSeedData {
  code: string;
  name: string;
  /** Derived from code prefix. Populated by deriveModule(). */
  module: string;
  description?: string;
}

/**
 * Derives the module/category string from a permission code.
 * "alert.acknowledge"   → "alert"
 * "ai.approve_recommendation" → "ai"
 *
 * The module value is stored in Permission.module in the database.
 */
export function deriveModule(code: string): string {
  return code.split('.')[0];
}

/**
 * Raw permission definitions from the RBAC spec.
 * module is intentionally omitted here — it is injected by buildPermissions().
 */
const rawPermissions: Array<{ code: string; name: string; description?: string }> = [
  // ── Authentication ──────────────────────────────────────────────────────────
  { code: 'auth.login',           name: 'Login',           description: 'Authenticate and obtain a session token.' },
  { code: 'auth.logout',          name: 'Logout',          description: 'Invalidate the current session.' },
  { code: 'auth.refresh',         name: 'Refresh Token',   description: 'Obtain a new access token using a refresh token.' },
  { code: 'auth.change_password', name: 'Change Password', description: 'Change own account password.' },

  // ── User Management ─────────────────────────────────────────────────────────
  { code: 'user.read',        name: 'Read Users',       description: 'View user profiles and role assignments.' },
  { code: 'user.create',      name: 'Create User',      description: 'Create new user accounts.' },
  { code: 'user.update',      name: 'Update User',      description: 'Edit user profile fields and status.' },
  { code: 'user.delete',      name: 'Delete User',      description: 'Permanently remove a user account.' },
  { code: 'user.assign_role', name: 'Assign Role',      description: 'Assign or revoke roles on a user account.' },
  { code: 'user.invite',      name: 'Invite User',      description: 'Send an invitation email to a new user.' },
  { code: 'user.activate',    name: 'Activate User',    description: 'Re-activate a suspended or inactive user account.' },
  { code: 'user.deactivate',  name: 'Deactivate User',  description: 'Suspend or deactivate a user account.' },

  // ── Organization ────────────────────────────────────────────────────────────
  { code: 'organization.read',         name: 'Read Organization',         description: 'View organization profile and settings.' },
  { code: 'organization.create',       name: 'Create Organization',       description: 'Register a new organization on the platform.' },
  { code: 'organization.update',       name: 'Update Organization',       description: 'Edit organization profile fields.' },
  { code: 'organization.delete',       name: 'Delete Organization',       description: 'Permanently remove an organization.' },
  { code: 'organization.settings',     name: 'Manage Organization Settings', description: 'Configure organization-level settings.' },
  { code: 'organization.subscription', name: 'Manage Subscription',       description: 'View and update the organization subscription plan.' },

  // ── Plant Management ────────────────────────────────────────────────────────
  { code: 'plant.read',         name: 'Read Plants',        description: 'View plant list and details.' },
  { code: 'plant.create',       name: 'Create Plant',       description: 'Register a new plant under the organization.' },
  { code: 'plant.update',       name: 'Update Plant',       description: 'Edit plant profile and configuration.' },
  { code: 'plant.delete',       name: 'Delete Plant',       description: 'Remove a plant from the organization.' },
  { code: 'plant.assign_users', name: 'Assign Users to Plant', description: 'Assign or remove users from a plant.' },

  // ── Treatment Plants ────────────────────────────────────────────────────────
  { code: 'treatment_plant.read',   name: 'Read Treatment Plants',   description: 'View treatment plant list and details.' },
  { code: 'treatment_plant.create', name: 'Create Treatment Plant',  description: 'Add a new treatment unit under a plant.' },
  { code: 'treatment_plant.update', name: 'Update Treatment Plant',  description: 'Edit treatment plant configuration.' },
  { code: 'treatment_plant.delete', name: 'Delete Treatment Plant',  description: 'Remove a treatment plant unit.' },

  // ── Controllers ─────────────────────────────────────────────────────────────
  { code: 'controller.read',   name: 'Read Controllers',   description: 'View controller list and status.' },
  { code: 'controller.create', name: 'Register Controller', description: 'Register a new controller device.' },
  { code: 'controller.update', name: 'Update Controller',  description: 'Edit controller configuration.' },
  { code: 'controller.delete', name: 'Delete Controller',  description: 'Remove a controller from the system.' },

  // ── Devices ─────────────────────────────────────────────────────────────────
  { code: 'device.read',      name: 'Read Devices',       description: 'View device list and status.' },
  { code: 'device.create',    name: 'Register Device',    description: 'Register a new device under a controller.' },
  { code: 'device.update',    name: 'Update Device',      description: 'Edit device configuration.' },
  { code: 'device.delete',    name: 'Delete Device',      description: 'Remove a device from the system.' },
  { code: 'device.configure', name: 'Configure Device',   description: 'Update device operational configuration and protocol adapter.' },
  { code: 'device.firmware',  name: 'Update Firmware',    description: 'Initiate firmware update on a device.' },

  // ── Sensors ─────────────────────────────────────────────────────────────────
  { code: 'sensor.read',      name: 'Read Sensors',      description: 'View sensor list, parameters, and calibration status.' },
  { code: 'sensor.create',    name: 'Register Sensor',   description: 'Register a new sensor on a device.' },
  { code: 'sensor.update',    name: 'Update Sensor',     description: 'Edit sensor configuration.' },
  { code: 'sensor.delete',    name: 'Delete Sensor',     description: 'Remove a sensor from the system.' },
  { code: 'sensor.calibrate', name: 'Calibrate Sensor',  description: 'Record a sensor calibration event.' },

  // ── Telemetry ────────────────────────────────────────────────────────────────
  { code: 'telemetry.read',   name: 'Read Telemetry',    description: 'View real-time and historical sensor telemetry.' },
  { code: 'telemetry.export', name: 'Export Telemetry',  description: 'Export telemetry data to CSV or external formats.' },
  { code: 'telemetry.import', name: 'Import Telemetry',  description: 'Import historical telemetry from external sources.' },

  // ── Alerts ──────────────────────────────────────────────────────────────────
  { code: 'alert.read',        name: 'Read Alerts',        description: 'View active and historical alerts.' },
  { code: 'alert.acknowledge', name: 'Acknowledge Alert',  description: 'Mark an alert as acknowledged.' },
  { code: 'alert.resolve',     name: 'Resolve Alert',      description: 'Mark an alert as resolved.' },
  { code: 'alert.assign',      name: 'Assign Alert',       description: 'Assign an alert to a specific user or team.' },

  // ── Maintenance ─────────────────────────────────────────────────────────────
  { code: 'maintenance.read',     name: 'Read Maintenance',    description: 'View maintenance records and schedules.' },
  { code: 'maintenance.create',   name: 'Create Maintenance',  description: 'Create a new maintenance record or work order.' },
  { code: 'maintenance.update',   name: 'Update Maintenance',  description: 'Edit maintenance record details.' },
  { code: 'maintenance.complete', name: 'Complete Maintenance', description: 'Mark a maintenance task as completed.' },
  { code: 'maintenance.delete',   name: 'Delete Maintenance',  description: 'Remove a maintenance record.' },

  // ── Compliance ──────────────────────────────────────────────────────────────
  { code: 'compliance.read',    name: 'Read Compliance',    description: 'View compliance records and scores.' },
  { code: 'compliance.create',  name: 'Create Compliance',  description: 'Create a new compliance evaluation record.' },
  { code: 'compliance.update',  name: 'Update Compliance',  description: 'Edit a compliance record.' },
  { code: 'compliance.approve', name: 'Approve Compliance', description: 'Approve a compliance record for regulatory submission.' },
  { code: 'compliance.export',  name: 'Export Compliance',  description: 'Export compliance reports and records.' },

  // ── Reports ─────────────────────────────────────────────────────────────────
  { code: 'report.read',     name: 'Read Reports',      description: 'View generated reports.' },
  { code: 'report.generate', name: 'Generate Report',   description: 'Trigger report generation.' },
  { code: 'report.export',   name: 'Export Report',     description: 'Download or export a report file.' },
  { code: 'report.schedule', name: 'Schedule Report',   description: 'Configure automated report schedules.' },
  { code: 'report.delete',   name: 'Delete Report',     description: 'Remove a report record.' },

  // ── Digital Wastewater Passport ─────────────────────────────────────────────
  { code: 'passport.read',     name: 'Read Passport',     description: 'View Digital Wastewater Passports.' },
  { code: 'passport.generate', name: 'Generate Passport', description: 'Generate a new Digital Wastewater Passport.' },
  { code: 'passport.approve',  name: 'Approve Passport',  description: 'Approve a passport for issuance.' },
  { code: 'passport.export',   name: 'Export Passport',   description: 'Download or export a passport document.' },

  // ── AI ──────────────────────────────────────────────────────────────────────
  { code: 'ai.read',                   name: 'Read AI',                    description: 'View AI models, predictions, and recommendations.' },
  { code: 'ai.predict',                name: 'Run AI Prediction',          description: 'Trigger an AI inference run.' },
  { code: 'ai.configure',              name: 'Configure AI',               description: 'Manage AI model configuration and thresholds.' },
  { code: 'ai.train',                  name: 'Train AI Model',             description: 'Initiate an AI model training job.' },
  { code: 'ai.deploy',                 name: 'Deploy AI Model',            description: 'Deploy a trained model version to production.' },
  { code: 'ai.rollback',               name: 'Rollback AI Model',          description: 'Roll back a deployed model to a previous version.' },
  { code: 'ai.approve_recommendation', name: 'Approve AI Recommendation',  description: 'Approve or reject a pending AI recommendation.' },
  { code: 'ai.feedback',               name: 'Submit AI Feedback',         description: 'Submit operator feedback on AI predictions and recommendations.' },

  // ── Business Rules ──────────────────────────────────────────────────────────
  { code: 'rule.read',   name: 'Read Rules',   description: 'View business rules and conditions.' },
  { code: 'rule.create', name: 'Create Rule',  description: 'Create a new business rule.' },
  { code: 'rule.update', name: 'Update Rule',  description: 'Edit an existing business rule.' },
  { code: 'rule.delete', name: 'Delete Rule',  description: 'Remove a business rule.' },

  // ── Notifications ────────────────────────────────────────────────────────────
  { code: 'notification.read',      name: 'Read Notifications',      description: 'View notification history.' },
  { code: 'notification.send',      name: 'Send Notification',       description: 'Send a manual notification to users.' },
  { code: 'notification.configure', name: 'Configure Notifications', description: 'Configure notification channels and templates.' },

  // ── Audit Logs ──────────────────────────────────────────────────────────────
  { code: 'audit.read',   name: 'Read Audit Logs',   description: 'View the platform audit trail.' },
  { code: 'audit.export', name: 'Export Audit Logs', description: 'Export audit log records.' },

  // ── Commercial & Licensing ──────────────────────────────────────────────────
  { code: 'subscription.read',   name: 'Read Subscription',    description: 'View current subscription plan details.' },
  { code: 'subscription.update', name: 'Update Subscription',  description: 'Change or upgrade the organization subscription.' },
  { code: 'module.read',         name: 'Read Modules',         description: 'View available and enabled platform modules.' },
  { code: 'module.update',       name: 'Update Modules',       description: 'Enable or disable platform modules for an organization.' },
  { code: 'plan.read',           name: 'Read Plans',           description: 'View available subscription plans.' },
  { code: 'plan.update',         name: 'Update Plans',         description: 'Create or modify subscription plan definitions.' },
];

/**
 * Exported permissions with module derived automatically from each code prefix.
 * This is what seeders consume.
 */
export const permissions: PermissionSeedData[] = rawPermissions.map((p) => ({
  ...p,
  module: deriveModule(p.code),
}));

export const PERMISSION_CODES = permissions.map((p) => p.code);
