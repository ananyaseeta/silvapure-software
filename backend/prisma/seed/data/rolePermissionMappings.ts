/**
 * SILVAPURE — Role-Permission Mappings
 *
 * Source of truth: RBAC Specification v1.
 *
 * This file encodes the full permission matrix exactly as specified.
 * Each entry is [RoleCode, permissionCode].
 *
 * Schema Resolution Note:
 *   The RBAC spec defines 7 columns. The schema RoleCode enum has 5 values.
 *   The following column → RoleCode mapping is applied (see roles.ts for rationale):
 *
 *     Platform Admin            → ADMIN
 *     Organization Admin        → ADMIN
 *     Plant Manager             → PLANT_MANAGER
 *     Environmental Officer     → ENVIRONMENTAL_OFFICER
 *     Maintenance Engineer      → OPERATOR        (union with Plant Operator)
 *     Plant Operator            → OPERATOR
 *     Viewer / Auditor          → VIEWER
 *
 *   Because ADMIN covers both Platform Admin and Organization Admin columns,
 *   the union of both columns is granted to ADMIN.
 *
 *   Because OPERATOR covers both Maintenance Engineer and Plant Operator columns,
 *   the union of both columns is granted to OPERATOR.
 *
 * Rules:
 *   - Only add entries that are marked ✓ in the RBAC spec.
 *   - Never add a permission that does not exist in permissions.ts.
 *   - Never add a RoleCode that does not exist in the schema enum.
 *   - This file is the single source of truth. The seeder reads this — do not
 *     hand-edit role_permissions rows in the database.
 */

import { RoleCode } from '@prisma/client';

export interface RolePermissionMapping {
  roleCode:       RoleCode;
  permissionCode: string;
}

// Helper to expand one permission code to multiple roles at once
function grant(permissionCode: string, ...roleCodes: RoleCode[]): RolePermissionMapping[] {
  return roleCodes.map((roleCode) => ({ roleCode, permissionCode }));
}

// ─── Auth (all roles) ────────────────────────────────────────────────────────
const auth: RolePermissionMapping[] = [
  ...grant('auth.login',           RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('auth.logout',          RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('auth.refresh',         RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('auth.change_password', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
];

// ─── User Management ─────────────────────────────────────────────────────────
// Platform Admin ✓, Organization Admin ✓ → both map to ADMIN
// All others X
const userMgmt: RolePermissionMapping[] = [
  ...grant('user.read',        RoleCode.ADMIN),
  ...grant('user.create',      RoleCode.ADMIN),
  ...grant('user.update',      RoleCode.ADMIN),
  ...grant('user.delete',      RoleCode.ADMIN),
  ...grant('user.assign_role', RoleCode.ADMIN),
  ...grant('user.invite',      RoleCode.ADMIN),
  ...grant('user.activate',    RoleCode.ADMIN),
  ...grant('user.deactivate',  RoleCode.ADMIN),
];

// ─── Organization ────────────────────────────────────────────────────────────
// organization.read:         Platform Admin ✓, Org Admin ✓, Plant Manager ✓, Env Officer ✓
// organization.create:       Platform Admin ✓ only
// organization.update:       Platform Admin ✓, Org Admin ✓
// organization.delete:       Platform Admin ✓ only
// organization.settings:     Platform Admin ✓, Org Admin ✓
// organization.subscription: Platform Admin ✓, Org Admin ✓
const org: RolePermissionMapping[] = [
  ...grant('organization.read',         RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('organization.create',       RoleCode.ADMIN),
  ...grant('organization.update',       RoleCode.ADMIN),
  ...grant('organization.delete',       RoleCode.ADMIN),
  ...grant('organization.settings',     RoleCode.ADMIN),
  ...grant('organization.subscription', RoleCode.ADMIN),
];

// ─── Plant Management ────────────────────────────────────────────────────────
// plant.read:         all roles
// plant.create:       Platform Admin ✓, Org Admin ✓
// plant.update:       Platform Admin ✓, Org Admin ✓, Plant Manager ✓
// plant.delete:       Platform Admin ✓, Org Admin ✓
// plant.assign_users: Platform Admin ✓, Org Admin ✓, Plant Manager ✓
const plant: RolePermissionMapping[] = [
  ...grant('plant.read',         RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('plant.create',       RoleCode.ADMIN),
  ...grant('plant.update',       RoleCode.ADMIN, RoleCode.PLANT_MANAGER),
  ...grant('plant.delete',       RoleCode.ADMIN),
  ...grant('plant.assign_users', RoleCode.ADMIN, RoleCode.PLANT_MANAGER),
];

// ─── Treatment Plants ────────────────────────────────────────────────────────
const treatmentPlant: RolePermissionMapping[] = [
  ...grant('treatment_plant.read',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('treatment_plant.create', RoleCode.ADMIN, RoleCode.PLANT_MANAGER),
  ...grant('treatment_plant.update', RoleCode.ADMIN, RoleCode.PLANT_MANAGER),
  ...grant('treatment_plant.delete', RoleCode.ADMIN),
];

// ─── Controllers ─────────────────────────────────────────────────────────────
// controller.create/update: Platform Admin, Org Admin, Plant Manager, Maintenance Engineer → ADMIN, PLANT_MANAGER, OPERATOR
// controller.delete:        Platform Admin, Org Admin, Maintenance Engineer → ADMIN, OPERATOR
const controller: RolePermissionMapping[] = [
  ...grant('controller.read',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('controller.create', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('controller.update', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('controller.delete', RoleCode.ADMIN, RoleCode.OPERATOR),
];

// ─── Devices ─────────────────────────────────────────────────────────────────
const device: RolePermissionMapping[] = [
  ...grant('device.read',      RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('device.create',    RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('device.update',    RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('device.delete',    RoleCode.ADMIN, RoleCode.OPERATOR),
  ...grant('device.configure', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('device.firmware',  RoleCode.ADMIN, RoleCode.OPERATOR),
];

// ─── Sensors ─────────────────────────────────────────────────────────────────
const sensor: RolePermissionMapping[] = [
  ...grant('sensor.read',      RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('sensor.create',    RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('sensor.update',    RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('sensor.delete',    RoleCode.ADMIN, RoleCode.OPERATOR),
  ...grant('sensor.calibrate', RoleCode.ADMIN, RoleCode.OPERATOR),
];

// ─── Telemetry ───────────────────────────────────────────────────────────────
// telemetry.export: Platform Admin, Org Admin, Plant Manager, Env Officer, Viewer ✓
// telemetry.import: Platform Admin, Org Admin, Maintenance Engineer → ADMIN, OPERATOR
const telemetry: RolePermissionMapping[] = [
  ...grant('telemetry.read',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('telemetry.export', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.VIEWER),
  ...grant('telemetry.import', RoleCode.ADMIN, RoleCode.OPERATOR),
];

// ─── Alerts ──────────────────────────────────────────────────────────────────
// alert.acknowledge: Platform Admin, Org Admin, Plant Manager, Maintenance Engineer, Plant Operator
// alert.resolve:     Platform Admin, Org Admin, Plant Manager, Maintenance Engineer
// alert.assign:      Platform Admin, Org Admin, Plant Manager, Maintenance Engineer
const alert: RolePermissionMapping[] = [
  ...grant('alert.read',        RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('alert.acknowledge', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('alert.resolve',     RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('alert.assign',      RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
];

// ─── Maintenance ─────────────────────────────────────────────────────────────
// maintenance.complete: Platform Admin, Org Admin, Plant Manager, Maintenance Engineer, Plant Operator
const maintenance: RolePermissionMapping[] = [
  ...grant('maintenance.read',     RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('maintenance.create',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('maintenance.update',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('maintenance.complete', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.OPERATOR),
  ...grant('maintenance.delete',   RoleCode.ADMIN, RoleCode.OPERATOR),
];

// ─── Compliance ──────────────────────────────────────────────────────────────
// All ops: Platform Admin, Org Admin, Plant Manager, Env Officer
// compliance.export: also Viewer
const compliance: RolePermissionMapping[] = [
  ...grant('compliance.read',    RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('compliance.create',  RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('compliance.update',  RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('compliance.approve', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('compliance.export',  RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.VIEWER),
];

// ─── Reports ─────────────────────────────────────────────────────────────────
// report.generate/export: Platform Admin, Org Admin, Plant Manager, Env Officer
// report.export: also Viewer
// report.schedule/delete: Platform Admin, Org Admin only
const report: RolePermissionMapping[] = [
  ...grant('report.read',     RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('report.generate', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('report.export',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.VIEWER),
  ...grant('report.schedule', RoleCode.ADMIN),
  ...grant('report.delete',   RoleCode.ADMIN),
];

// ─── Digital Wastewater Passport ─────────────────────────────────────────────
// passport.export: also Viewer
const passport: RolePermissionMapping[] = [
  ...grant('passport.read',     RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('passport.generate', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('passport.approve',  RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('passport.export',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.VIEWER),
];

// ─── AI ──────────────────────────────────────────────────────────────────────
// ai.predict / ai.approve_recommendation: Platform Admin, Org Admin, Plant Manager, Env Officer
// ai.configure: Platform Admin, Org Admin → ADMIN only
// ai.train / ai.deploy / ai.rollback: Platform Admin only → ADMIN
// ai.feedback: Platform Admin, Org Admin, Plant Manager, Env Officer, Maintenance Engineer, Plant Operator
const ai: RolePermissionMapping[] = [
  ...grant('ai.read',                   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('ai.predict',                RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('ai.configure',              RoleCode.ADMIN),
  ...grant('ai.train',                  RoleCode.ADMIN),
  ...grant('ai.deploy',                 RoleCode.ADMIN),
  ...grant('ai.rollback',               RoleCode.ADMIN),
  ...grant('ai.approve_recommendation', RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER),
  ...grant('ai.feedback',               RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR),
];

// ─── Business Rules ──────────────────────────────────────────────────────────
// rule.read: Platform Admin, Org Admin, Plant Manager, Env Officer, Viewer
// rule.create/update: Platform Admin, Org Admin → ADMIN
// rule.delete: Platform Admin only → ADMIN
const rules: RolePermissionMapping[] = [
  ...grant('rule.read',   RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.VIEWER),
  ...grant('rule.create', RoleCode.ADMIN),
  ...grant('rule.update', RoleCode.ADMIN),
  ...grant('rule.delete', RoleCode.ADMIN),
];

// ─── Notifications ───────────────────────────────────────────────────────────
// notification.send: Platform Admin, Org Admin, Plant Manager, Env Officer, Maintenance Engineer, Plant Operator
// notification.configure: Platform Admin, Org Admin → ADMIN
const notifications: RolePermissionMapping[] = [
  ...grant('notification.read',      RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR, RoleCode.VIEWER),
  ...grant('notification.send',      RoleCode.ADMIN, RoleCode.PLANT_MANAGER, RoleCode.ENVIRONMENTAL_OFFICER, RoleCode.OPERATOR),
  ...grant('notification.configure', RoleCode.ADMIN),
];

// ─── Audit Logs ──────────────────────────────────────────────────────────────
// Platform Admin, Org Admin → ADMIN only
const audit: RolePermissionMapping[] = [
  ...grant('audit.read',   RoleCode.ADMIN),
  ...grant('audit.export', RoleCode.ADMIN),
];

// ─── Commercial & Licensing ──────────────────────────────────────────────────
// subscription.read / module.read / plan.read: Platform Admin, Org Admin → ADMIN
// subscription.update / module.update / plan.update: Platform Admin only → ADMIN
const commercial: RolePermissionMapping[] = [
  ...grant('subscription.read',   RoleCode.ADMIN),
  ...grant('subscription.update', RoleCode.ADMIN),
  ...grant('module.read',         RoleCode.ADMIN),
  ...grant('module.update',       RoleCode.ADMIN),
  ...grant('plan.read',           RoleCode.ADMIN),
  ...grant('plan.update',         RoleCode.ADMIN),
];

// ─── Final export: flat deduplicated array ───────────────────────────────────

const allMappings: RolePermissionMapping[] = [
  ...auth,
  ...userMgmt,
  ...org,
  ...plant,
  ...treatmentPlant,
  ...controller,
  ...device,
  ...sensor,
  ...telemetry,
  ...alert,
  ...maintenance,
  ...compliance,
  ...report,
  ...passport,
  ...ai,
  ...rules,
  ...notifications,
  ...audit,
  ...commercial,
];

// Deduplicate in case the same (roleCode, permissionCode) pair appears in
// multiple groups (defensive — should not happen with this structure).
const seen = new Set<string>();
export const rolePermissionMappings: RolePermissionMapping[] = allMappings.filter((m) => {
  const key = `${m.roleCode}::${m.permissionCode}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});
