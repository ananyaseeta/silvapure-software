/**
 * Role Seeder
 *
 * Upserts all roles defined in data/roles.ts inside a single transaction.
 * Safe to run multiple times — existing rows are updated, not duplicated.
 */

import { PrismaClient } from '@prisma/client';
import { roles } from '../data/roles';
import { upsertRole } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedRoles(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding roles…', { count: roles.length });

  await runInTransaction(prisma, 'RoleSeeder', async (tx) => {
    for (const role of roles) {
      await upsertRole(tx as PrismaClient, role);
      logger.info(`  upserted role`, { code: role.code });
    }
  });

  logger.summary('RoleSeeder', { upserted: roles.length });
}
