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
    }
  });
  logger.summary('AIModelSeeder', { upserted: aiModels.length });
}
