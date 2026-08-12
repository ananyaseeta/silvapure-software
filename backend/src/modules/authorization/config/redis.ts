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

    redisClient.on('error',       (err: Error) => console.error('[Redis] Connection error:', err.message));
    redisClient.on('connect',     ()           => console.log('[Redis] Connected'));
    redisClient.on('reconnecting',()           => console.warn('[Redis] Reconnecting…'));
  }

  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
