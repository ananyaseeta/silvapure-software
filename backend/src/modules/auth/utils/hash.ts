/**
 * Password Hashing — Argon2id
 *
 * Argon2id is the recommended algorithm from OWASP for password hashing.
 * Memory cost, time cost, and parallelism are driven by env config so they
 * can be tuned per environment without code changes.
 *
 * All operations are async — never block the event loop.
 */

import argon2 from 'argon2';
import { env } from '../../../config/env';

const argon2Options: argon2.Options = {
  type:        argon2.argon2id,
  memoryCost:  env.ARGON2_MEMORY_COST,
  timeCost:    env.ARGON2_TIME_COST,
  parallelism: env.ARGON2_PARALLELISM,
};

/**
 * Hashes a plain-text password using Argon2id.
 * @returns The encoded hash string (includes algorithm, salt, params).
 */
export async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText, argon2Options);
}

/**
 * Verifies a plain-text password against an Argon2 hash.
 * Returns `true` if the password matches, `false` otherwise.
 * Never throws on a mismatch — only throws on internal errors.
 */
export async function verifyPassword(
  hash: string,
  plainText: string,
): Promise<boolean> {
  return argon2.verify(hash, plainText, argon2Options);
}
