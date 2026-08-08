/**
 * Module Seeder
 * Upserts all platform module definitions from data/modules.ts.
 * No dependencies — safe to run in Phase 1.
 * Must run BEFORE subscriptionSeeder (plans reference modules).
 */

import { PrismaClient } from '@prisma/client';
import { modules } from '../data/modules';
import { upsertModule } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedModules(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding platform modules…', { count: modules.length });

  await runInTransaction(prisma, 'ModuleSeeder', async (tx) => {
    for (const mod of modules) {
      await upsertModule(tx as PrismaClient, mod);
    }
  });

  logger.summary('ModuleSeeder', { upserted: modules.length });
}
