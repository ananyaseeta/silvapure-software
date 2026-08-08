/**
 * Generic Upsert Helpers
 *
 * Thin wrappers that enforce idempotent upsert semantics across all seeders.
 * Every seeder uses these helpers — no direct prisma.X.create() calls in seed code.
 *
 * Strategy:
 *   - create    → data to insert on first run
 *   - update    → data to apply on subsequent runs (safe overwrite of mutable fields)
 *   - where     → the unique business key used to locate the record
 *
 * This means running `prisma db seed` multiple times is always safe.
 */

import { PrismaClient } from '@prisma/client';

// ─── Role ────────────────────────────────────────────────────────────────────

export async function upsertRole(
  prisma: PrismaClient,
  data: { code: string; name: string; description?: string },
): Promise<void> {
  await prisma.role.upsert({
    where:  { code: data.code as any },
    create: { code: data.code as any, name: data.name, description: data.description },
    update: { name: data.name, description: data.description },
  });
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function upsertPermission(
  prisma: PrismaClient,
  data: { code: string; name: string; module: string; description?: string },
): Promise<void> {
  await prisma.permission.upsert({
    where:  { code: data.code },
    create: { code: data.code, name: data.name, module: data.module, description: data.description },
    update: { name: data.name, module: data.module, description: data.description },
  });
}

// ─── RolePermission ───────────────────────────────────────────────────────────

/**
 * Upserts a role-permission junction record.
 * Uses a find-or-create pattern because RolePermission has a composite @@id
 * and Prisma's upsert on composite keys requires the full composite where clause.
 */
export async function upsertRolePermission(
  prisma: PrismaClient,
  roleCode: string,
  permissionCode: string,
): Promise<void> {
  const role = await prisma.role.findUnique({ where: { code: roleCode as any } });
  const permission = await prisma.permission.findUnique({ where: { code: permissionCode } });

  if (!role) {
    throw new Error(`upsertRolePermission: Role not found — code="${roleCode}"`);
  }
  if (!permission) {
    throw new Error(`upsertRolePermission: Permission not found — code="${permissionCode}"`);
  }

  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId:       role.id,
        permissionId: permission.id,
      },
    },
    create: {
      roleId:       role.id,
      permissionId: permission.id,
    },
    update: {}, // junction has no mutable fields — update is a no-op
  });
}

// ─── IndustryType ─────────────────────────────────────────────────────────────

export async function upsertIndustryType(
  prisma: PrismaClient,
  data: { name: string; description?: string },
): Promise<void> {
  await prisma.industryType.upsert({
    where:  { name: data.name },
    create: { name: data.name, description: data.description },
    update: { description: data.description },
  });
}

// ─── TreatmentTechnology ──────────────────────────────────────────────────────

export async function upsertTreatmentTechnology(
  prisma: PrismaClient,
  data: { name: string; description?: string },
): Promise<void> {
  await prisma.treatmentTechnology.upsert({
    where:  { name: data.name },
    create: { name: data.name, description: data.description },
    update: { description: data.description },
  });
}

// ─── SensorType ───────────────────────────────────────────────────────────────

export async function upsertSensorType(
  prisma: PrismaClient,
  data: { code: string; name: string; description?: string },
): Promise<void> {
  await prisma.sensorType.upsert({
    where:  { code: data.code },
    create: { code: data.code, name: data.name, description: data.description },
    update: { name: data.name, description: data.description },
  });
}

// ─── Parameter ────────────────────────────────────────────────────────────────

export async function upsertParameter(
  prisma: PrismaClient,
  data: {
    code:          string;
    name:          string;
    unit:          string;
    acceptableMin: number | null;
    acceptableMax: number | null;
    description?:  string;
  },
): Promise<void> {
  await prisma.parameter.upsert({
    where:  { code: data.code },
    create: {
      code:          data.code,
      name:          data.name,
      unit:          data.unit,
      acceptableMin: data.acceptableMin ?? undefined,
      acceptableMax: data.acceptableMax ?? undefined,
      description:   data.description,
    },
    update: {
      name:          data.name,
      unit:          data.unit,
      acceptableMin: data.acceptableMin ?? undefined,
      acceptableMax: data.acceptableMax ?? undefined,
      description:   data.description,
    },
  });
}

// ─── ProtocolAdapter ─────────────────────────────────────────────────────────

export async function upsertProtocolAdapter(
  prisma: PrismaClient,
  data: {
    code:          string;
    name:          string;
    protocol:      string;
    version:       string | null;
    endpoint:      string | null;
    port:          number | null;
    configuration: Record<string, unknown> | null;
    isEnabled:     boolean;
  },
): Promise<void> {
  await prisma.protocolAdapter.upsert({
    where:  { code: data.code },
    create: {
      code:          data.code,
      name:          data.name,
      protocol:      data.protocol as any,
      version:       data.version ?? undefined,
      endpoint:      data.endpoint ?? undefined,
      port:          data.port ?? undefined,
      configuration: data.configuration ?? undefined,
      isEnabled:     data.isEnabled,
    },
    update: {
      name:          data.name,
      protocol:      data.protocol as any,
      version:       data.version ?? undefined,
      endpoint:      data.endpoint ?? undefined,
      port:          data.port ?? undefined,
      configuration: data.configuration ?? undefined,
      isEnabled:     data.isEnabled,
    },
  });
}

// ─── Module ───────────────────────────────────────────────────────────────────

export async function upsertModule(
  prisma: PrismaClient,
  data: { code: string; name: string; description?: string; isCore: boolean },
): Promise<void> {
  await prisma.module.upsert({
    where:  { code: data.code as any },
    create: { code: data.code as any, name: data.name, description: data.description, isCore: data.isCore },
    update: { name: data.name, description: data.description, isCore: data.isCore },
  });
}

// ─── SubscriptionPlan ─────────────────────────────────────────────────────────

export async function upsertSubscriptionPlan(
  prisma: PrismaClient,
  data: {
    code:        string;
    name:        string;
    description: string;
    planType:    string;
    price:       number | null;
    billingCycle: string;
    isActive:    boolean;
  },
): Promise<void> {
  await prisma.subscriptionPlan.upsert({
    where:  { code: data.code },
    create: {
      code:         data.code,
      name:         data.name,
      description:  data.description,
      planType:     data.planType as any,
      price:        data.price ?? undefined,
      billingCycle: data.billingCycle as any,
      isActive:     data.isActive,
    },
    update: {
      name:         data.name,
      description:  data.description,
      planType:     data.planType as any,
      price:        data.price ?? undefined,
      billingCycle: data.billingCycle as any,
      isActive:     data.isActive,
    },
  });
}

// ─── Rule (with conditions and actions) ──────────────────────────────────────

export async function upsertRule(
  prisma: PrismaClient,
  data: {
    code:        string;
    name:        string;
    description: string;
    category:    string;
    severity:    string;
    enabled:     boolean;
    conditions:  Array<{ field: string; operator: string; value: unknown }>;
    actions:     Array<{ actionType: string; executionOrder: number; configuration?: Record<string, unknown> }>;
  },
): Promise<void> {
  const rule = await prisma.rule.upsert({
    where:  { code: data.code },
    create: {
      code:        data.code,
      name:        data.name,
      description: data.description,
      category:    data.category as any,
      severity:    data.severity as any,
      enabled:     data.enabled,
    },
    update: {
      name:        data.name,
      description: data.description,
      category:    data.category as any,
      severity:    data.severity as any,
      enabled:     data.enabled,
    },
  });

  // Recreate conditions and actions on each run (delete + create for idempotency)
  await prisma.ruleCondition.deleteMany({ where: { ruleId: rule.id } });
  await prisma.ruleAction.deleteMany({ where: { ruleId: rule.id } });

  for (const cond of data.conditions) {
    await prisma.ruleCondition.create({
      data: {
        ruleId:   rule.id,
        field:    cond.field,
        operator: cond.operator as any,
        value:    cond.value as any,
      },
    });
  }

  for (const action of data.actions) {
    await prisma.ruleAction.create({
      data: {
        ruleId:         rule.id,
        actionType:     action.actionType as any,
        executionOrder: action.executionOrder,
        configuration:  action.configuration ?? undefined,
      },
    });
  }
}

// ─── AIModel ──────────────────────────────────────────────────────────────────

export async function upsertAIModel(
  prisma: PrismaClient,
  data: {
    code:                     string;
    name:                     string;
    description:              string;
    type:                     string;
    isEnabled:                boolean;
    explainabilityMethod:     string;
    supportsExplainability:   boolean;
    supportsRecommendations:  boolean;
    supportsFeedbackLearning: boolean;
  },
): Promise<void> {
  await prisma.aIModel.upsert({
    where:  { code: data.code },
    create: {
      code:                     data.code,
      name:                     data.name,
      description:              data.description,
      type:                     data.type as any,
      isEnabled:                data.isEnabled,
      explainabilityMethod:     data.explainabilityMethod as any,
      supportsExplainability:   data.supportsExplainability,
      supportsRecommendations:  data.supportsRecommendations,
      supportsFeedbackLearning: data.supportsFeedbackLearning,
    },
    update: {
      name:                     data.name,
      description:              data.description,
      type:                     data.type as any,
      isEnabled:                data.isEnabled,
      explainabilityMethod:     data.explainabilityMethod as any,
      supportsExplainability:   data.supportsExplainability,
      supportsRecommendations:  data.supportsRecommendations,
      supportsFeedbackLearning: data.supportsFeedbackLearning,
    },
  });
}
