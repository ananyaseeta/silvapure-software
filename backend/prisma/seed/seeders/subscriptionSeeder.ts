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
      await upsertSubscriptionPlan(txPrisma, {
        code:        plan.code,
        name:        plan.name,
        description: plan.description,
        planType:    plan.planType,
        price:       plan.price,
        billingCycle: plan.billingCycle,
        isActive:    plan.isActive,
      });

      const planRow = await txPrisma.subscriptionPlan.findUniqueOrThrow({ where: { code: plan.code } });

      await txPrisma.planLimit.deleteMany({ where: { planId: planRow.id } });
      for (const lim of plan.limits) {
        await txPrisma.planLimit.create({ data: { planId: planRow.id, resource: lim.resource, limit: lim.limit } });
      }

      await txPrisma.planModule.deleteMany({ where: { planId: planRow.id } });
      for (const modCode of plan.modules) {
        const modRow = await txPrisma.module.findUniqueOrThrow({ where: { code: modCode } });
        await txPrisma.planModule.create({ data: { planId: planRow.id, moduleId: modRow.id, enabled: true } });
      }
    }
  });

  logger.summary('SubscriptionPlanSeeder', { upserted: plans.length });
}
