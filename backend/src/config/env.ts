/**
 * Environment Configuration
 *
 * Validates and exposes all required environment variables at startup.
 * The application will throw immediately if any required variable is missing
 * or malformed — fail-fast prevents silent misconfigurations in production.
 *
 * Usage:
 *   import { env } from '../config/env.js';
 *   const secret = env.JWT_ACCESS_SECRET;
 */

import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT — Access Token
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),

  // JWT — Refresh Token
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cookies
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z
    .enum(['strict', 'lax', 'none'])
    .default('strict'),

  // Password Reset
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().int().positive().default(60),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),

  // Argon2 — memory cost in KiB (default 64 MiB)
  ARGON2_MEMORY_COST: z.coerce.number().int().positive().default(65536),
  ARGON2_TIME_COST:   z.coerce.number().int().positive().default(3),
  ARGON2_PARALLELISM: z.coerce.number().int().positive().default(1),

  // Redis — permission cache
  REDIS_URL:                z.string().default('redis://localhost:6379'),
  REDIS_PERMISSION_TTL_SEC: z.coerce.number().int().positive().default(300),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(
      `\n[Config] Environment validation failed:\n${formatted}\n`,
    );
  }

  return result.data;
}

export const env: Env = validateEnv();
