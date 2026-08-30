/**
 * Subscription Plan Seed Data
 *
 * Matches SubscriptionPlan model:
 *   { code: String @unique, name: String, description: String?,
 *     planType: PlanType, price: Decimal?, billingCycle: BillingCycle, isActive: Boolean }
 *
 * Also declares plan limits and module inclusions used by subscriptionSeeder.ts.
 */

import { PlanType, BillingCycle, ModuleCode, ResourceType } from '@prisma/client';

export interface PlanLimitData {
  resource: ResourceType;
  limit:    number;
}

export interface PlanSeedData {
  code:        string;
  name:        string;
  description: string;
  planType:    PlanType;
  price:       number | null;
  billingCycle: BillingCycle;
  isActive:    boolean;
  modules:     ModuleCode[];
  limits:      PlanLimitData[];
}

export const plans: PlanSeedData[] = [
  {
    code:        'COMMUNITY_MONTHLY',
    name:        'Community Plan',
    description: 'For small NGOs and pilot projects. Core monitoring up to 1 plant, 5 devices, and 5 users.',
    planType:    PlanType.COMMUNITY,
    price:       0,
    billingCycle: BillingCycle.MONTHLY,
    isActive:    true,
    modules:     [ModuleCode.ALERTS, ModuleCode.DEVICE_MANAGEMENT],
    limits:      [
      { resource: ResourceType.PLANTS,  limit: 1 },
      { resource: ResourceType.DEVICES, limit: 5 },
      { resource: ResourceType.USERS,   limit: 5 },
      { resource: ResourceType.REPORTS, limit: 5 },
      { resource: ResourceType.STORAGE_GB, limit: 10 },
    ],
  },
  {
    code:        'PROFESSIONAL_MONTHLY',
    name:        'Professional Plan (Monthly)',
    description: 'For single-site organisations. Full monitoring, compliance, and reporting up to 3 plants.',
    planType:    PlanType.PROFESSIONAL,
    price:       499,
    billingCycle: BillingCycle.MONTHLY,
    isActive:    true,
    modules:     [
      ModuleCode.ALERTS, ModuleCode.DEVICE_MANAGEMENT,
      ModuleCode.REPORTS, ModuleCode.COMPLIANCE,
    ],
    limits:      [
      { resource: ResourceType.PLANTS,  limit: 3 },
      { resource: ResourceType.DEVICES, limit: 50 },
      { resource: ResourceType.USERS,   limit: 25 },
      { resource: ResourceType.REPORTS, limit: 100 },
      { resource: ResourceType.STORAGE_GB, limit: 100 },
    ],
  },
  {
    code:        'PROFESSIONAL_YEARLY',
    name:        'Professional Plan (Annual)',
    description: 'Annual commitment with 2 months free. Full monitoring, compliance, and reporting.',
    planType:    PlanType.PROFESSIONAL,
    price:       4990,
    billingCycle: BillingCycle.YEARLY,
    isActive:    true,
    modules:     [
      ModuleCode.ALERTS, ModuleCode.DEVICE_MANAGEMENT,
      ModuleCode.REPORTS, ModuleCode.COMPLIANCE,
    ],
    limits:      [
      { resource: ResourceType.PLANTS,  limit: 3 },
      { resource: ResourceType.DEVICES, limit: 50 },
      { resource: ResourceType.USERS,   limit: 25 },
      { resource: ResourceType.REPORTS, limit: 100 },
      { resource: ResourceType.STORAGE_GB, limit: 100 },
    ],
  },
  {
    code:        'ENTERPRISE_YEARLY',
    name:        'Enterprise Plan',
    description: 'For multi-site organisations. Unlimited plants, AI engine, predictive maintenance, and DWP.',
    planType:    PlanType.ENTERPRISE,
    price:       null,
    billingCycle: BillingCycle.YEARLY,
    isActive:    true,
    modules:     [
      ModuleCode.ALERTS, ModuleCode.DEVICE_MANAGEMENT,
      ModuleCode.REPORTS, ModuleCode.COMPLIANCE,
      ModuleCode.DIGITAL_WASTEWATER_PASSPORT,
      ModuleCode.PREDICTIVE_MAINTENANCE,
      ModuleCode.ANALYTICS, ModuleCode.AI,
    ],
    limits:      [
      { resource: ResourceType.PLANTS,      limit: 9999 },
      { resource: ResourceType.DEVICES,     limit: 9999 },
      { resource: ResourceType.USERS,       limit: 9999 },
      { resource: ResourceType.REPORTS,     limit: 9999 },
      { resource: ResourceType.AI_MODELS,   limit: 50 },
      { resource: ResourceType.STORAGE_GB,  limit: 10000 },
    ],
  },
  {
    code:        'GOVERNMENT_YEARLY',
    name:        'Government / Regulatory Plan',
    description: 'For PCBs, SPCBs, and regulatory authorities. Full read access across registered organisations.',
    planType:    PlanType.GOVERNMENT,
    price:       null,
    billingCycle: BillingCycle.YEARLY,
    isActive:    true,
    modules:     [
      ModuleCode.ALERTS, ModuleCode.DEVICE_MANAGEMENT,
      ModuleCode.REPORTS, ModuleCode.COMPLIANCE,
      ModuleCode.DIGITAL_WASTEWATER_PASSPORT,
    ],
    limits:      [
      { resource: ResourceType.PLANTS,     limit: 9999 },
      { resource: ResourceType.USERS,      limit: 500 },
      { resource: ResourceType.REPORTS,    limit: 9999 },
      { resource: ResourceType.STORAGE_GB, limit: 1000 },
    ],
  },
];
