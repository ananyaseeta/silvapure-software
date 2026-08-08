/**
 * AI Model Seeder
 * Upserts all platform AI model definitions from data/ai.ts.
 * No FK dependencies on other seeded tables — safe to run in Phase 1.
 *
 * This seeder creates the AIModel catalogue rows only.
 * AIModelVersion rows are created by the MLOps pipeline, not by seed.
 */

import { PrismaClient } from '@prisma/client';
import { aiModels } from '../data/ai';
import { upsertAIModel } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedAIModels(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding AI models…', { count: aiModels.length });

  await runInTransaction(prisma, 'AIModelSeeder', async (tx) => {
    for (const model of aiModels) {
      await upsertAIModel(tx as PrismaClient, model);
      logger.info(`  upserted AI model`, { code: model.code, type: model.type });
    }
  });

  logger.summary('AIModelSeeder', { upserted: aiModels.length });
}
