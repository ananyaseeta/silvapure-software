import { PrismaClient } from '@prisma/client';
import { sensorTypes } from '../data/sensorTypes';
import { upsertSensorType } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedSensorTypes(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding sensor types…', { count: sensorTypes.length });
  await runInTransaction(prisma, 'SensorTypeSeeder', async (tx) => {
    for (const st of sensorTypes) {
      await upsertSensorType(tx as PrismaClient, st);
    }
  });
  logger.summary('SensorTypeSeeder', { upserted: sensorTypes.length });
}
