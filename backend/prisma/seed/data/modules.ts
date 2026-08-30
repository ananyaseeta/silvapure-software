/**
 * Module Seed Data
 *
 * Matches Module model:
 *   { code: ModuleCode @unique, name: String, description: String?, isCore: Boolean }
 */

import { ModuleCode } from '@prisma/client';

export interface ModuleSeedData {
  code:        ModuleCode;
  name:        string;
  description: string;
  isCore:      boolean;
}

export const modules: ModuleSeedData[] = [
  {
    code:        ModuleCode.ALERTS,
    name:        'Alerts & Notifications',
    description: 'Real-time alert management with severity classification, acknowledgement, and resolution workflow.',
    isCore:      true,
  },
  {
    code:        ModuleCode.DEVICE_MANAGEMENT,
    name:        'Device Management',
    description: 'Controller, device, and sensor registration, configuration, and communication status monitoring.',
    isCore:      true,
  },
  {
    code:        ModuleCode.REPORTS,
    name:        'Reports',
    description: 'Automated and on-demand report generation for daily, weekly, monthly, and compliance periods.',
    isCore:      false,
  },
  {
    code:        ModuleCode.COMPLIANCE,
    name:        'Compliance Management',
    description: 'Regulatory compliance tracking, scoring, and audit-ready record management.',
    isCore:      false,
  },
  {
    code:        ModuleCode.DIGITAL_WASTEWATER_PASSPORT,
    name:        'Digital Wastewater Passport',
    description: 'Blockchain-ready wastewater treatment certificates for regulatory and supply-chain use.',
    isCore:      false,
  },
  {
    code:        ModuleCode.PREDICTIVE_MAINTENANCE,
    name:        'Predictive Maintenance',
    description: 'AI-driven failure prediction and maintenance scheduling to reduce unplanned downtime.',
    isCore:      false,
  },
  {
    code:        ModuleCode.ANALYTICS,
    name:        'Advanced Analytics',
    description: 'Trend analysis, benchmarking, and operational KPI dashboards across treatment plants.',
    isCore:      false,
  },
  {
    code:        ModuleCode.AI,
    name:        'AI Engine',
    description: 'Unified AI inference platform covering plant health scoring, water quality prediction, and anomaly detection.',
    isCore:      false,
  },
];
