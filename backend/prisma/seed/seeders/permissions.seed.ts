/**
 * Permission Seeder
 *
 * Upserts all permissions defined in data/permissions.ts.
 *
 * Permissions are grouped by module and committed in a single transaction.
 * The `module` field is already derived from the code prefix by permissions.ts —
 * no manual category assignment is needed here.
 *
 * Safe to run multiple times.
 */

import { PrismaClient } from '@prisma/client';
import { permissions } from '../data/permissions';
import { upsertPermission } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedPermissions(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding permissions…', { count: permissions.length });

  // Group by module for structured log output
  const byModule = permissions.reduce<Record<string, number>>((acc, p) => {
    acc[p.module] = (acc[p.module] ?? 0) + 1;
    return acc;
  }, {});

  logger.info('  permission distribution by module', byModule);

  await runInTransaction(prisma, 'PermissionSeeder', async (tx) => {
    for (const permission of permissions) {
      await upsertPermission(tx as PrismaClient, permission);
    }
  });

  logger.summary('PermissionSeeder', { upserted: permissions.length, modules: Object.keys(byModule).length });
}
