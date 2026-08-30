import { PrismaClient, PlantType, PlantStatus, TreatmentPlantType, UserStatus } from '@prisma/client';
import { DEMO_ADMIN_USER, DEMO_ORG, DEMO_PLANT, DEMO_TREATMENT_PLANT } from '../data/demo';
import { logger } from '../utils/logger';

export async function seedDemoData(prisma: PrismaClient): Promise<void> {
  if (process.env['SEED_DEMO'] !== 'true') {
    logger.warn('Demo seeder skipped — set SEED_DEMO=true to enable');
    return;
  }

  logger.info('Seeding demo data…');

  const industryType = await prisma.industryType.findUnique({ where: { name: DEMO_ORG.industryTypeName } });
  if (!industryType) throw new Error(`Demo seeder: IndustryType "${DEMO_ORG.industryTypeName}" not found. Run industrySeeder first.`);

  const org = await prisma.organization.upsert({
    where:  { organizationCode: DEMO_ORG.organizationCode },
    create: { organizationCode: DEMO_ORG.organizationCode, legalName: DEMO_ORG.legalName, displayName: DEMO_ORG.displayName, email: DEMO_ORG.email, industryTypeId: industryType.id },
    update: { legalName: DEMO_ORG.legalName, displayName: DEMO_ORG.displayName, email: DEMO_ORG.email, industryTypeId: industryType.id },
  });
  logger.info('  upserted demo organisation', { code: org.organizationCode });

  const user = await prisma.user.upsert({
    where:  { email: DEMO_ADMIN_USER.email },
    create: { organizationId: org.id, firstName: DEMO_ADMIN_USER.firstName, lastName: DEMO_ADMIN_USER.lastName, email: DEMO_ADMIN_USER.email, passwordHash: DEMO_ADMIN_USER.passwordHash, jobTitle: DEMO_ADMIN_USER.jobTitle, status: UserStatus.ACTIVE },
    update: { firstName: DEMO_ADMIN_USER.firstName, lastName: DEMO_ADMIN_USER.lastName, jobTitle: DEMO_ADMIN_USER.jobTitle, status: UserStatus.ACTIVE },
  });
  logger.info('  upserted demo user', { email: user.email });

  const adminRole = await prisma.role.findUnique({ where: { code: 'ADMIN' } });
  if (!adminRole) throw new Error('Demo seeder: ADMIN role not found. Run roleSeeder first.');
  await prisma.userRole.upsert({
    where:  { userId_roleId: { userId: user.id, roleId: adminRole.id } },
    create: { userId: user.id, roleId: adminRole.id },
    update: {},
  });
  logger.info('  assigned ADMIN role to demo user');

  const plant = await prisma.plant.upsert({
    where:  { plantCode: DEMO_PLANT.plantCode },
    create: { organizationId: org.id, plantCode: DEMO_PLANT.plantCode, name: DEMO_PLANT.name, address: DEMO_PLANT.address, latitude: DEMO_PLANT.latitude, longitude: DEMO_PLANT.longitude, timezone: DEMO_PLANT.timezone, plantType: PlantType.MUNICIPAL, status: PlantStatus.ACTIVE },
    update: { name: DEMO_PLANT.name, address: DEMO_PLANT.address, latitude: DEMO_PLANT.latitude, longitude: DEMO_PLANT.longitude },
  });
  logger.info('  upserted demo plant', { code: plant.plantCode });

  const technology = await prisma.treatmentTechnology.findUnique({ where: { name: DEMO_TREATMENT_PLANT.technologyName } });
  if (!technology) throw new Error(`Demo seeder: TreatmentTechnology "${DEMO_TREATMENT_PLANT.technologyName}" not found. Run treatmentSeeder first.`);

  const treatmentPlant = await prisma.treatmentPlant.upsert({
    where:  { treatmentPlantCode: DEMO_TREATMENT_PLANT.treatmentPlantCode },
    create: { plantId: plant.id, technologyId: technology.id, treatmentPlantCode: DEMO_TREATMENT_PLANT.treatmentPlantCode, name: DEMO_TREATMENT_PLANT.name, type: TreatmentPlantType.STP, commissionedOn: DEMO_TREATMENT_PLANT.commissionedOn, status: PlantStatus.ACTIVE },
    update: { name: DEMO_TREATMENT_PLANT.name, technologyId: technology.id, commissionedOn: DEMO_TREATMENT_PLANT.commissionedOn },
  });
  logger.info('  upserted demo treatment plant', { code: treatmentPlant.treatmentPlantCode });

  logger.summary('DemoSeeder', { org: 1, users: 1, plants: 1, treatmentPlants: 1 });
}
