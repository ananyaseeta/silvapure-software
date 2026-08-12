import { PrismaClient } from '@prisma/client';
import { rules } from '../data/rules';
import { upsertRule } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedRules(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding business rules…', { count: rules.length });
  await runInTransaction(prisma, 'RuleSeeder', async (tx) => {
    for (const rule of rules) {
      await upsertRule(tx as PrismaClient, rule);
    }
  });
  logger.summary('RuleSeeder', { upserted: rules.length });
}
