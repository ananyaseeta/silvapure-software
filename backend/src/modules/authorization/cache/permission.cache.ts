/**
 * Redis Permission Cache
 *
 * Implements IPermissionCache using ioredis.
 * Stores permission-code sets as Redis SMEMBERS (a Redis Set per user).
 *
 * Key schema:
 *   silvapure:perms:{userId}  →  Redis Set of permission code strings
 *
 * Design decisions:
 *   - Uses Redis Sets (SADD / SMEMBERS) rather than a JSON string so that
 *     individual membership checks could be done with SISMEMBER in future.
 *   - On Redis failure the cache degrades gracefully: errors are logged and
 *     a null cache-miss is returned so the service falls back to the DB.
 *   - TTL is set via EXPIRE after SADD so the whole set expires atomically.
 *   - invalidateAll() uses SCAN to avoid blocking Redis with KEYS *.
 */

import type Redis from 'ioredis';
import type { IPermissionCache } from '../types/authorization.types';
import { env } from '../../../config/env';

const KEY_PREFIX = 'silvapure:perms:';
const SCAN_COUNT = 100;

function cacheKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export class RedisPermissionCache implements IPermissionCache {
  constructor(private readonly redis: Redis) {}

  async get(userId: string): Promise<ReadonlySet<string> | null> {
    try {
      const members = await this.redis.smembers(cacheKey(userId));
      // smembers returns [] for a missing key — distinguish via EXISTS
      if (members.length === 0) {
        const exists = await this.redis.exists(cacheKey(userId));
        if (!exists) return null;
      }
      return new Set(members);
    } catch (err) {
      console.warn('[PermissionCache] get error — cache miss fallback', err);
      return null;
    }
  }

  async set(userId: string, codes: ReadonlySet<string>): Promise<void> {
    try {
      const key = cacheKey(userId);
      if (codes.size === 0) {
        // Store a sentinel so we can distinguish "empty perms" from "not cached"
        await this.redis.sadd(key, '__empty__');
      } else {
        await this.redis.sadd(key, ...codes);
      }
      await this.redis.expire(key, env.REDIS_PERMISSION_TTL_SEC);
    } catch (err) {
      console.warn('[PermissionCache] set error — continuing without cache', err);
    }
  }

  async invalidate(userId: string): Promise<void> {
    try {
      await this.redis.del(cacheKey(userId));
    } catch (err) {
      console.warn('[PermissionCache] invalidate error', err);
    }
  }

  async invalidateAll(): Promise<void> {
    try {
      const pattern = `${KEY_PREFIX}*`;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH', pattern,
          'COUNT', SCAN_COUNT,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      console.warn('[PermissionCache] invalidateAll error', err);
    }
  }
}

// ─── Null-object cache (test / no-Redis environments) ────────────────────────

/**
 * A no-op cache that always misses.
 * Drop-in replacement for RedisPermissionCache when Redis is unavailable
 * or not desired (e.g. unit tests, local dev without Redis).
 */
export class NullPermissionCache implements IPermissionCache {
  async get(_userId: string): Promise<null> {
    return null;
  }
  async set(_userId: string, _codes: ReadonlySet<string>): Promise<void> {
    // intentional no-op
  }
  async invalidate(_userId: string): Promise<void> {
    // intentional no-op
  }
  async invalidateAll(): Promise<void> {
    // intentional no-op
  }
}
