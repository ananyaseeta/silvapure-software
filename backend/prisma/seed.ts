/**
 * SILVAPURE — Seed Entry Point
 *
 * Invoked by Prisma via the "prisma.seed" script in package.json:
 *   "seed": "tsx prisma/seed.ts"
 *
 * Run manually:
 *   npx prisma db seed
 *
 * Run with demo data:
 *   SEED_DEMO=true npx prisma db seed
 *
 * =============================================================================
 * SEEDER DEPENDENCY ORDER
 * =============================================================================
 *
 * Phase 1 — Independent reference data (all run in parallel)
 *   ├── seedRoles
 *   ├── seedPermissions
 *   ├── seedIndustryTypes
 *   ├── seedTreatmentTechnologies
 *   ├── seedSensorTypes
 *   ├── seedParameters
 *   ├── seedProtocolAdapters
 *   ├── seedModules           ← must finish before Phase 2 (subscriptions need modules)
 *   ├── seedRules             ← no FK deps on seeded data
 *   └── seedAIModels          ← no FK deps on seeded data
 *
 * Phase 2 — Depends on Phase 1 rows existing
 *   ├── seedRolePermissions   ← requires roles + permissions
 *   └── seedSubscriptionPlans ← requires modules
 *
 * Phase 3 — Optional demo data (guarded by SEED_DEMO=true)
 *   └── seedDemoData          ← requires industries + treatmentTechnologies + roles
 *
 * =============================================================================
 * Design principles
 * =============================================================================
 *   - Each seeder is independently transactional. A failure in one seeder
 *     rolls back only that seeder's changes.
 *   - Phase 1 seeders run in parallel for speed.
 *   - Phase 2 seeders run sequentially after Phase 1 is fully settled.
 *   - Idempotent: safe to run on a populated database.
 *   - Exit code 1 on any seeder failure — Prisma CLI surfaces the error.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './seed/utils/logger';

// ── Phase 1 seeders ───────────────────────────────────────────────────────────
import { seedRoles }                 from './seed/seeders/roles.seed';
import { seedPermissions }           from './seed/seeders/permissions.seed';
import { seedIndustryTypes }         from './seed/seeders/industrySeeder';
import { seedTreatmentTechnologies } from './seed/seeders/treatmentSeeder';
import { seedSensorTypes }           from './seed/seeders/sensorSeeder';
import { seedParameters }            from './seed/seeders/parameterSeeder';
import { seedProtocolAdapters }      from './seed/seeders/protocolSeeder';
import { seedModules }               from './seed/seeders/moduleSeeder';
import { seedRules }                 from './seed/seeders/ruleSeeder';
import { seedAIModels }              from './seed/seeders/aiSeeder';

// ── Phase 2 seeders ───────────────────────────────────────────────────────────
import { seedRolePermissions }     from './seed/seeders/rolePermissions.seed';
import { seedSubscriptionPlans }   from './seed/seeders/subscriptionSeeder';

// ── Phase 3 seeders ───────────────────────────────────────────────────────────
import { seedDemoData } from './seed/seeders/demoSeeder';

// ─── Main ─────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function main(): Promise<void> {
  logger.section('SILVAPURE — Database Seed');
  logger.info('Environment', {
    nodeEnv:  process.env['NODE_ENV'] ?? 'unset',
    seedDemo: process.env['SEED_DEMO'] ?? 'false',
  });

  // ── Phase 1: All independent reference data in parallel ───────────────────
  logger.section('Phase 1 — Reference Data (parallel)');
  await Promise.all([
    seedRoles(prisma),
    seedPermissions(prisma),
    seedIndustryTypes(prisma),
    seedTreatmentTechnologies(prisma),
    seedSensorTypes(prisma),
    seedParameters(prisma),
    seedProtocolAdapters(prisma),
    seedModules(prisma),
    seedRules(prisma),
    seedAIModels(prisma),
  ]);
  logger.success('Phase 1 complete');

  // ── Phase 2: Data with FK dependencies on Phase 1 ─────────────────────────
  logger.section('Phase 2 — Derived Data');
  await seedRolePermissions(prisma);
  await seedSubscriptionPlans(prisma);
  logger.success('Phase 2 complete');

  // ── Phase 3: Optional demo data ───────────────────────────────────────────
  logger.section('Phase 3 — Demo Data');
  await seedDemoData(prisma);
  logger.success('Phase 3 complete');

  // ── Summary ───────────────────────────────────────────────────────────────
  logger.section('Seed Complete');
  logger.success('All seed data applied successfully.');
}

main()
  .catch((err) => {
    logger.error('Seed failed — process exiting with code 1', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
