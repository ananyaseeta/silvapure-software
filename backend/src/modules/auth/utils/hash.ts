import argon2 from 'argon2';
import { env } from '../../../config/env';

const argon2Options: argon2.Options = {
  type:        argon2.argon2id,
  memoryCost:  env.ARGON2_MEMORY_COST,
  timeCost:    env.ARGON2_TIME_COST,
  parallelism: env.ARGON2_PARALLELISM,
};

export async function hashPassword(plainText: string): Promise<string> {
  return argon2.hash(plainText, argon2Options);
}

export async function verifyPassword(hash: string, plainText: string): Promise<boolean> {
  return argon2.verify(hash, plainText, argon2Options);
}
