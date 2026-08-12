import { PrismaClient } from '@prisma/client';
import { treatmentTechnologies } from '../data/treatmentTypes';
import { upsertTreatmentTechnology } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedTreatmentTechnologies(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding treatment technologies…', { count: treatmentTechnologies.length });
  await runInTransaction(prisma, 'TreatmentTechnologySeeder', async (tx) => {
    for (const tech of treatmentTechnologies) {
      await upsertTreatmentTechnology(tx as PrismaClient, tech);
    }
  });
  logger.summary('TreatmentTechnologySeeder', { upserted: treatmentTechnologies.length });
}
