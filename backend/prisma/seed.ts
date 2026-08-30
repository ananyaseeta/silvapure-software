import { PrismaClient } from '@prisma/client';
import { logger } from './seed/utils/logger';

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
import { seedRolePermissions }       from './seed/seeders/rolePermissions.seed';
import { seedSubscriptionPlans }     from './seed/seeders/subscriptionSeeder';
import { seedDemoData }              from './seed/seeders/demoSeeder';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  logger.section('SILVAPURE — Database Seed');
  logger.info('Environment', {
    nodeEnv:  process.env['NODE_ENV'] ?? 'unset',
    seedDemo: process.env['SEED_DEMO'] ?? 'false',
  });

  logger.section('Phase 1 — Reference Data');
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

  logger.section('Phase 2 — Derived Data');
  await seedRolePermissions(prisma);
  await seedSubscriptionPlans(prisma);
  logger.success('Phase 2 complete');

  logger.section('Phase 3 — Demo Data');
  await seedDemoData(prisma);
  logger.success('Phase 3 complete');

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
