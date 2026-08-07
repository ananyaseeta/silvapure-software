/**
 * Seed Transaction Wrapper
 *
 * Wraps a seeder function inside a Prisma interactive transaction so that
 * all upserts within a single seeder either fully succeed or fully roll back.
 *
 * Usage:
 *   await runInTransaction(prisma, 'RoleSeeder', async (tx) => {
 *     await upsertRole(tx, ...);
 *   });
 *
 * Notes:
 *   - The `tx` argument passed to the callback is a transactional PrismaClient.
 *     Pass it to upsert helpers instead of the top-level `prisma` instance.
 *   - Timeout is set to 30 s to accommodate large permission sets.
 *   - On failure the error is re-thrown after logging so the outer orchestrator
 *     can decide whether to abort or continue remaining seeders.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export async function runInTransaction(
  prisma: PrismaClient,
  seederName: string,
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<void>,
): Promise<void> {
  try {
    await prisma.$transaction(fn, {
      timeout:    30_000, // 30 seconds
      maxWait:    10_000, // wait up to 10 s for a connection slot
    });
    logger.success(`Transaction committed — ${seederName}`);
  } catch (err) {
    logger.error(`Transaction rolled back — ${seederName}`, err);
    throw err;
  }
}
