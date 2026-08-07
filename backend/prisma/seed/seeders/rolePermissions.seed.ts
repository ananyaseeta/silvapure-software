/**
 * Role-Permission Seeder
 *
 * Upserts every role-permission junction record defined in
 * data/rolePermissionMappings.ts.
 *
 * Dependency order requirement:
 *   Roles and Permissions MUST be seeded before this seeder runs.
 *   upsertRolePermission() performs FK lookups by code and throws if either
 *   the role or permission row is missing.
 *
 * The seeder runs each upsert sequentially within a single transaction.
 * If any mapping references a non-existent role or permission code the entire
 * transaction rolls back, leaving the database unchanged.
 *
 * Safe to run multiple times — junction rows have no mutable fields so
 * repeated runs are true no-ops after the first.
 */

import { PrismaClient } from '@prisma/client';
import { rolePermissionMappings } from '../data/rolePermissionMappings';
import { upsertRolePermission } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedRolePermissions(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding role-permission mappings…', { count: rolePermissionMappings.length });

  // Summary by role for log output
  const byRole = rolePermissionMappings.reduce<Record<string, number>>((acc, m) => {
    acc[m.roleCode] = (acc[m.roleCode] ?? 0) + 1;
    return acc;
  }, {});

  logger.info('  mapping distribution by role', byRole);

  await runInTransaction(prisma, 'RolePermissionSeeder', async (tx) => {
    for (const mapping of rolePermissionMappings) {
      await upsertRolePermission(
        tx as PrismaClient,
        mapping.roleCode,
        mapping.permissionCode,
      );
    }
  });

  logger.summary('RolePermissionSeeder', {
    upserted: rolePermissionMappings.length,
    roles:    Object.keys(byRole).length,
  });
}
