/**
 * Industry Type Seeder
 * Upserts all industry types from data/industries.ts.
 * No dependencies — safe to run first.
 */

import { PrismaClient } from '@prisma/client';
import { industryTypes } from '../data/industries';
import { upsertIndustryType } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedIndustryTypes(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding industry types…', { count: industryTypes.length });

  await runInTransaction(prisma, 'IndustryTypeSeeder', async (tx) => {
    for (const industry of industryTypes) {
      await upsertIndustryType(tx as PrismaClient, industry);
    }
  });

  logger.summary('IndustryTypeSeeder', { upserted: industryTypes.length });
}
