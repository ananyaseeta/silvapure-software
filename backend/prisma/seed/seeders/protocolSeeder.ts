/**
 * Protocol Adapter Seeder
 * Upserts all protocol adapter definitions from data/protocols.ts.
 * No dependencies — safe to run in Phase 1.
 */

import { PrismaClient } from '@prisma/client';
import { protocolAdapters } from '../data/protocols';
import { upsertProtocolAdapter } from '../utils/upsert';
import { runInTransaction } from '../utils/transaction';
import { logger } from '../utils/logger';

export async function seedProtocolAdapters(prisma: PrismaClient): Promise<void> {
  logger.info('Seeding protocol adapters…', { count: protocolAdapters.length });

  await runInTransaction(prisma, 'ProtocolAdapterSeeder', async (tx) => {
    for (const adapter of protocolAdapters) {
      await upsertProtocolAdapter(tx as PrismaClient, adapter);
    }
  });

  logger.summary('ProtocolAdapterSeeder', { upserted: protocolAdapters.length });
}
