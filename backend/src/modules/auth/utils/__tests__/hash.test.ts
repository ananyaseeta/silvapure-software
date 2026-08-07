/**
 * Unit tests — hash utils (Argon2id)
 *
 * These tests call the real Argon2 library. The env is bootstrapped with
 * cheap settings (m=64, t=1, p=1) so the suite stays fast while still
 * exercising the real algorithm path.
 */

// ── bootstrap cheap argon2 settings before the module loads ──────────────────
process.env['NODE_ENV']            = 'test';
process.env['DATABASE_URL']        = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET']   = 'test-access-secret-at-least-32-chars!!';
process.env['JWT_REFRESH_SECRET']  = 'test-refresh-secret-at-least-32-chars!';
process.env['ARGON2_MEMORY_COST']  = '64';
process.env['ARGON2_TIME_COST']    = '1';
process.env['ARGON2_PARALLELISM']  = '1';

import { hashPassword, verifyPassword } from '../hash';

describe('hashPassword', () => {
  it('returns a non-empty string', async () => {
    const hash = await hashPassword('MyP@ssw0rd!');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces an Argon2id-encoded string (starts with $argon2id$)', async () => {
    const hash = await hashPassword('MyP@ssw0rd!');
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('generates different hashes for the same password (salted)', async () => {
    const hash1 = await hashPassword('SamePassword1!');
    const hash2 = await hashPassword('SamePassword1!');
    expect(hash1).not.toBe(hash2);
  });

  it('handles passwords with special characters', async () => {
    const hash = await hashPassword('P@$$w0rd!<>&"');
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('handles long passwords (128 chars)', async () => {
    const long = 'A1!'.padEnd(128, 'abcXYZ@1');
    const hash = await hashPassword(long);
    expect(hash).toMatch(/^\$argon2id\$/);
  });
});

describe('verifyPassword', () => {
  it('returns true for a correct password', async () => {
    const plain = 'Correct$Horse99';
    const hash  = await hashPassword(plain);
    await expect(verifyPassword(hash, plain)).resolves.toBe(true);
  });

  it('returns false for an incorrect password', async () => {
    const hash = await hashPassword('Original$Pass1');
    await expect(verifyPassword(hash, 'Wrong$Pass1')).resolves.toBe(false);
  });

  it('returns false for an empty string against a real hash', async () => {
    const hash = await hashPassword('N0tEmpty$1');
    await expect(verifyPassword(hash, '')).resolves.toBe(false);
  });

  it('is case-sensitive', async () => {
    const hash = await hashPassword('CaseSensitive$1');
    await expect(verifyPassword(hash, 'casesensitive$1')).resolves.toBe(false);
    await expect(verifyPassword(hash, 'CaseSensitive$1')).resolves.toBe(true);
  });

  it('round-trips multiple different passwords independently', async () => {
    const passwords = ['Alpha$1pass', 'Beta$2pass', 'Gamma$3pass'];
    const hashes = await Promise.all(passwords.map(hashPassword));

    for (let i = 0; i < passwords.length; i++) {
      const pass = passwords[i] as string;
      const hash = hashes[i] as string;
      await expect(verifyPassword(hash, pass)).resolves.toBe(true);
      // Cross-check: other passwords must not match
      for (let j = 0; j < passwords.length; j++) {
        if (i !== j) {
          await expect(verifyPassword(hash, passwords[j] as string)).resolves.toBe(false);
        }
      }
    }
  });
});
