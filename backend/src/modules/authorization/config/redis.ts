/**
 * Redis Client Singleton
 *
 * Creates a single ioredis instance shared across the authorization module.
 * Lazy-initialised — the connection is not established until the first call
 * to getRedisClient(), which prevents startup failures in environments where
 * Redis is not available (e.g. unit tests that mock the cache).
 *
 * Connection errors are logged but do not crash the process — the permission
 * cache degrades gracefully to a DB-only path on Redis failure.
 */

import Redis from 'ioredis';
import { env } from '../../../config/env';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck:     true,
      lazyConnect:          false,
    });

    redisClient.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected');
    });

    redisClient.on('reconnecting', () => {
      console.warn('[Redis] Reconnecting…');
    });
  }

  return redisClient;
}

/** Gracefully closes the Redis connection. Call during process shutdown. */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
