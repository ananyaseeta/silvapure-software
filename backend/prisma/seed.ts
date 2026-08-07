/**
 * SILVAPURE — Seed Entry Point
 *
 * Invoked by Prisma via the "prisma.seed" script in package.json:
 *   "seed": "tsx prisma/seed.ts"
 *
 * Run manually:
 *   npx prisma db seed
 *
 * Seeder execution order is strict — dependencies must be satisfied:
 *
 *   Phase 2 — Task 1: RBAC
 *   ┌─────────────────────┐
 *   │  1. seedRoles        │  No dependencies
 *   │  2. seedPermissions  │  No dependencies (runs in parallel with roles)
 *   │  3. seedRolePerms    │  Requires roles + permissions to exist
 *   └─────────────────────┘
 *
 * Design principles:
 *   - Each seeder is independently transactional. A failure in one seeder
 *     rolls back only that seeder's changes.
 *   - Roles and permissions are independent and seeded in parallel.
 *   - Role-permission mappings are seeded last, after both complete.
 *   - No demo data, mock users, or test organizations are created here.
 *   - Idempotent: safe to run on a populated database.
 *   - Exit code 1 on any seeder failure — Prisma CLI will surface the error.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './seed/utils/logger';
import { seedRoles } from './seed/seeders/roles.seed';
import { seedPermissions } from './seed/seeders/permissions.seed';
import { seedRolePermissions } from './seed/seeders/rolePermissions.seed';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  logger.section('SILVAPURE Database Seed — Phase 2: RBAC');
  logger.info('Environment', { nodeEnv: process.env.NODE_ENV ?? 'unset' });

  // ── Step 1: Seed roles and permissions in parallel ─────────────────────────
  logger.section('Step 1 — Roles & Permissions');
  await Promise.all([
    seedRoles(prisma),
    seedPermissions(prisma),
  ]);

  // ── Step 2: Seed role-permission mappings ──────────────────────────────────
  // Must run after both roles and permissions exist in the database.
  logger.section('Step 2 — Role-Permission Mappings');
  await seedRolePermissions(prisma);

  // ── Done ───────────────────────────────────────────────────────────────────
  logger.section('Seed Complete');
  logger.success('All RBAC seed data applied successfully.');
}

main()
  .catch((err) => {
    logger.error('Seed failed — process exiting with code 1', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
