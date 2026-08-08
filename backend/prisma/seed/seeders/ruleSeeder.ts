/**
 * Rule Seeder
 * Upserts all business rules, their conditions, and actions from data/rules.ts.
 * No FK dependencies on other seeded tables — safe to run in Phase 1.
 *
 * Conditions and actions are deleted and recreated on each run to ensure
 * the database always matches the source data file exactly.
 */

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
      logger.info(`  upserted rule`, { code: rule.code, conditions: rule.conditions.length, actions: rule.actions.length });
    }
  });

  logger.summary('RuleSeeder', { upserted: rules.length });
}
