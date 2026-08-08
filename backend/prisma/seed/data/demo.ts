/**
 * Demo Data Definitions
 *
 * A minimal, reproducible demo dataset used for development and staging.
 * Production databases should NOT seed demo data — the demoSeeder checks
 * NODE_ENV and skips execution unless explicitly enabled.
 *
 * Includes:
 *   - 1 organization (Silvapure Demo Org)
 *   - 1 admin user (demo@silvapure.io / Demo@12345!)
 *   - 1 plant
 *   - 1 treatment plant
 */

export const DEMO_ORG = {
  industryTypeName: 'Municipal',
  organizationCode: 'DEMO-ORG-001',
  legalName:        'Silvapure Demo Organisation',
  displayName:      'Silvapure Demo',
  email:            'demo@silvapure.io',
} as const;

export const DEMO_ADMIN_USER = {
  firstName:    'Demo',
  lastName:     'Admin',
  email:        'demo@silvapure.io',
  /** Argon2id hash of 'Demo@12345!' with m=64,t=1,p=1 (dev-only settings). */
  passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$DEMO_SEED_PLACEHOLDER$DEMO_HASH_PLACEHOLDER',
  jobTitle:     'Platform Administrator',
} as const;

export const DEMO_PLANT = {
  plantCode:    'DEMO-PLANT-001',
  name:         'Demo STP Plant',
  address:      '123 Demo Street, Bangalore, Karnataka 560001',
  latitude:     12.9716,
  longitude:    77.5946,
  timezone:     'Asia/Kolkata',
} as const;

export const DEMO_TREATMENT_PLANT = {
  treatmentPlantCode: 'DEMO-TP-001',
  name:               'Demo Activated Sludge Unit',
  technologyName:     'Activated Sludge Process (ASP)',
  commissionedOn:     new Date('2024-01-01'),
} as const;
