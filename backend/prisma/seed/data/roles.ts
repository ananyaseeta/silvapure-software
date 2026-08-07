/**
 * SILVAPURE — Role Seed Data
 *
 * Source of truth: RBAC Specification v1 × schema.prisma RoleCode enum.
 *
 * The RBAC specification defines 7 columns. The schema RoleCode enum contains
 * 5 values. The mapping below resolves this:
 *
 *  RBAC Spec Column          → RoleCode in schema
 *  ─────────────────────────────────────────────
 *  Platform Admin            → ADMIN
 *  Organization Admin        → ADMIN            (org admins share the ADMIN code;
 *                                                scoped at the API layer via org ownership)
 *  Plant Manager             → PLANT_MANAGER
 *  Environmental Officer     → ENVIRONMENTAL_OFFICER
 *  Maintenance Engineer      → OPERATOR         (no dedicated code exists in schema;
 *                                                Maintenance Engineer permissions are the
 *                                                superset of OPERATOR permissions — see
 *                                                rolePermissionMappings.ts for exact grant list)
 *  Plant Operator            → OPERATOR
 *  Viewer / Auditor          → VIEWER
 *
 * Rules:
 *   - Never use a code that is not in the RoleCode enum.
 *   - Never rename a code — it is the stable business key used in upserts.
 *   - Descriptions are human-readable and safe to update between runs.
 *
 * NOTE: If Maintenance Engineer needs to be a separate role in a future phase,
 * add MAINTENANCE_ENGINEER to the RoleCode enum and create a new entry here.
 * Do NOT change the schema without a migration.
 */

import { RoleCode } from '@prisma/client';

export interface RoleSeedData {
  /** Must match a value in the schema RoleCode enum exactly. */
  code: RoleCode;
  name: string;
  description: string;
}

export const roles: RoleSeedData[] = [
  {
    code:        RoleCode.ADMIN,
    name:        'Administrator',
    description:
      'Full platform access. Covers both Platform Administrators (SILVAPURE internal ' +
      'operators) and Organization Administrators (customer-side account owners). ' +
      'Manages organizations, users, billing, subscriptions, AI model deployment, ' +
      'and all system configuration. Access scope is enforced at the API layer ' +
      'via organization ownership checks.',
  },
  {
    code:        RoleCode.PLANT_MANAGER,
    name:        'Plant Manager',
    description:
      'Manages day-to-day operations of one or more treatment plants within their ' +
      'organization. Can create and update plants, treatment units, controllers, ' +
      'devices, sensors, maintenance records, compliance records, and reports. ' +
      'Can approve compliance records, AI recommendations, and wastewater passports. ' +
      'Cannot manage billing, AI model training, or deployment.',
  },
  {
    code:        RoleCode.ENVIRONMENTAL_OFFICER,
    name:        'Environmental Officer',
    description:
      'Responsible for compliance monitoring, wastewater passport generation, and ' +
      'regulatory reporting. Can create and approve compliance records, generate ' +
      'and approve passports, run AI predictions, approve AI recommendations, ' +
      'and export telemetry and reports. Cannot manage devices, sensors, or ' +
      'platform-level configuration.',
  },
  {
    code:        RoleCode.OPERATOR,
    name:        'Operator',
    description:
      'Covers both Plant Operators and Maintenance Engineers. Plant Operators handle ' +
      'frontline monitoring: reading sensor data, acknowledging alerts, completing ' +
      'maintenance tasks, and submitting AI feedback. Maintenance Engineers additionally ' +
      'manage controllers, devices, sensors, maintenance records, and device firmware. ' +
      'Permission grants are the union of both RBAC columns. Fine-grained ' +
      'separation requires a dedicated MAINTENANCE_ENGINEER RoleCode in a future phase.',
  },
  {
    code:        RoleCode.VIEWER,
    name:        'Viewer / Auditor',
    description:
      'Read-only access across all operational data. Intended for government auditors, ' +
      'external consultants, or internal stakeholders. Can read and export reports, ' +
      'compliance documents, passports, and telemetry. Cannot create, update, or ' +
      'delete any records.',
  },
];

export const ROLE_CODES = roles.map((r) => r.code);
