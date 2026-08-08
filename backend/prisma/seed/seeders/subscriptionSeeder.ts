/**
 * Subscription Plan Seeder
 *
 * Upserts all SubscriptionPlan rows, their PlanLimit records, and their
 * PlanModule junction rows from data/plans.ts.
 *
 * Dependency order:
 *   - Module rows MUST exist before PlanModule junctions can be created.
 *   - Requires moduleSeeder to have run first.
 *
 * PlanLimit and PlanModule rows are deleted + recreated on each run so the
 * database stays in sync with the source data file.
 */

import { PrismaClient } from '@prisma/client';
import { plans } from '../data/plans';
import { upsertSubscriptionPlan } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedSubscriptionPlans(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding subscription plans…', { count: plans.length });

  await runInTransaction(prisma, 'SubscriptionPlanSeeder', async (tx) => {
    const txPrisma = tx as PrismaClient;

    for (const plan of plans) {
      // 1. Upsert the plan itself
      await upsertSubscriptionPlan(txPrisma, {
        code:        plan.code,
        name:        plan.name,
        description: plan.description,
        planType:    plan.planType,
        price:       plan.price,
        billingCycle: plan.billingCycle,
        isActive:    plan.isActive,
      });

      // 2. Fetch the row we just upserted to get its id
      const planRow = await txPrisma.subscriptionPlan.findUniqueOrThrow({
        where: { code: plan.code },
      });

      // 3. Recreate limits (delete-then-create for idempotency)
      await txPrisma.planLimit.deleteMany({ where: { planId: planRow.id } });
      for (const lim of plan.limits) {
        await txPrisma.planLimit.create({
          data: { planId: planRow.id, resource: lim.resource, limit: lim.limit },
        });
      }

      // 4. Recreate PlanModule junctions
      await txPrisma.planModule.deleteMany({ where: { planId: planRow.id } });
      for (const modCode of plan.modules) {
        const modRow = await txPrisma.module.findUniqueOrThrow({
          where: { code: modCode },
        });
        await txPrisma.planModule.create({
          data: { planId: planRow.id, moduleId: modRow.id, enabled: true },
        });
      }

      logger.info(`  upserted plan`, {
        code:    plan.code,
        limits:  plan.limits.length,
        modules: plan.modules.length,
      });
    }
  });

  logger.summary('SubscriptionPlanSeeder', { upserted: plans.length });
}
