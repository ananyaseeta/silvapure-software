/**
 * Prisma Client Singleton
 *
 * In development, Next.js/ts-node hot-reloads cause multiple PrismaClient
 * instances to be created which exhausts the connection pool. The global
 * singleton pattern prevents this.
 *
 * In production a new instance is always created (process never reloads).
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });
}

export const prisma: PrismaClient =
  env.NODE_ENV === 'production'
    ? createPrismaClient()
    : (global.__prisma ??= createPrismaClient());
