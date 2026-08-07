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
