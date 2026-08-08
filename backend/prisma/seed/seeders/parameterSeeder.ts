/**
 * Parameter Seeder
 * Upserts all water quality / process parameters from data/parameters.ts.
 * No dependencies — safe to run in Phase 1.
 */

import { PrismaClient } from '@prisma/client';
import { parameters } from '../data/parameters';
import { upsertParameter } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedParameters(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding parameters…', { count: parameters.length });

  await runInTransaction(prisma, 'ParameterSeeder', async (tx) => {
    for (const param of parameters) {
      await upsertParameter(tx as PrismaClient, param);
    }
  });

  logger.summary('ParameterSeeder', { upserted: parameters.length });
}
