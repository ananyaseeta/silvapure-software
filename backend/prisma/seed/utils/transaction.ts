import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export async function runInTransaction(
  prisma: PrismaClient,
  seederName: string,
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<void>,
): Promise<void> {
  try {
    await prisma.$transaction(fn, { timeout: 30_000, maxWait: 10_000 });
    logger.success(`Transaction committed — ${seederName}`);
  } catch (err) {
    logger.error(`Transaction rolled back — ${seederName}`, err);
    throw err;
  }
}
