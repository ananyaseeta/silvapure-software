/**
 * Business Rule Seed Data
 *
 * Matches Rule / RuleCondition / RuleAction models.
 * Rules are platform-level defaults that every organisation inherits.
 *
 * Rule model: { code @unique, name, description?, category, severity, enabled }
 * RuleCondition: { field, operator, value: Json }
 * RuleAction:    { actionType, executionOrder, configuration: Json? }
 */

import {
  RuleCategory, RuleSeverity, RuleOperator, RuleActionType,
} from '@prisma/client';

export interface RuleConditionData {
  field:    string;
  operator: RuleOperator;
  value:    unknown;
}

export interface RuleActionData {
  actionType:     RuleActionType;
  executionOrder: number;
  configuration?: Record<string, unknown>;
}

export interface RuleSeedData {
  code:        string;
  name:        string;
  description: string;
  category:    RuleCategory;
  severity:    RuleSeverity;
  enabled:     boolean;
  conditions:  RuleConditionData[];
  actions:     RuleActionData[];
}

export const rules: RuleSeedData[] = [
  // ── Compliance guardrails ──────────────────────────────────────────────────
  {
    code:        'RULE_PH_OUT_OF_RANGE',
    name:        'pH Out of Discharge Range',
    description: 'Alert and log when effluent pH falls outside 6.0–9.0 CPCB discharge limits.',
    category:    RuleCategory.COMPLIANCE,
    severity:    RuleSeverity.HIGH,
    enabled:     true,
    conditions:  [
      { field: 'parameter.code', operator: RuleOperator.EQUALS, value: 'pH' },
    ],
    actions:     [
      { actionType: RuleActionType.RAISE_ALERT,          executionOrder: 1, configuration: { severity: 'HIGH' } },
      { actionType: RuleActionType.SEND_NOTIFICATION,    executionOrder: 2, configuration: { channel: 'EMAIL' } },
      { actionType: RuleActionType.LOG_EVENT,            executionOrder: 3 },
    ],
  },
  {
    code:        'RULE_BOD_EXCEEDS_LIMIT',
    name:        'BOD Exceeds Discharge Limit',
    description: 'Raise a critical alert when BOD₅ exceeds 30 mg/L (CPCB inland water limit).',
    category:    RuleCategory.COMPLIANCE,
    severity:    RuleSeverity.CRITICAL,
    enabled:     true,
    conditions:  [
      { field: 'parameter.code',  operator: RuleOperator.EQUALS,       value: 'BOD' },
      { field: 'telemetry.value', operator: RuleOperator.GREATER_THAN,  value: 30 },
    ],
    actions:     [
      { actionType: RuleActionType.RAISE_ALERT,       executionOrder: 1, configuration: { severity: 'CRITICAL' } },
      { actionType: RuleActionType.SEND_NOTIFICATION, executionOrder: 2, configuration: { channel: 'SMS' } },
      { actionType: RuleActionType.LOG_EVENT,         executionOrder: 3 },
    ],
  },
  {
    code:        'RULE_COD_EXCEEDS_LIMIT',
    name:        'COD Exceeds Discharge Limit',
    description: 'Alert when COD exceeds 250 mg/L (CPCB General Standards, Sch. VI).',
    category:    RuleCategory.COMPLIANCE,
    severity:    RuleSeverity.HIGH,
    enabled:     true,
    conditions:  [
      { field: 'parameter.code',  operator: RuleOperator.EQUALS,      value: 'COD' },
      { field: 'telemetry.value', operator: RuleOperator.GREATER_THAN, value: 250 },
    ],
    actions:     [
      { actionType: RuleActionType.RAISE_ALERT,       executionOrder: 1, configuration: { severity: 'HIGH' } },
      { actionType: RuleActionType.SEND_NOTIFICATION, executionOrder: 2 },
      { actionType: RuleActionType.LOG_EVENT,         executionOrder: 3 },
    ],
  },
  // ── Operational rules ─────────────────────────────────────────────────────
  {
    code:        'RULE_DO_LOW',
    name:        'Low Dissolved Oxygen in Aeration Tank',
    description: 'Warn when aeration tank DO drops below 2 mg/L, risking biological treatment failure.',
    category:    RuleCategory.OPERATIONAL,
    severity:    RuleSeverity.MEDIUM,
    enabled:     true,
    conditions:  [
      { field: 'parameter.code',  operator: RuleOperator.EQUALS,    value: 'DO' },
      { field: 'telemetry.value', operator: RuleOperator.LESS_THAN,  value: 2 },
    ],
    actions:     [
      { actionType: RuleActionType.RAISE_ALERT,                executionOrder: 1, configuration: { severity: 'MEDIUM' } },
      { actionType: RuleActionType.GENERATE_RECOMMENDATION,    executionOrder: 2, configuration: { action: 'Increase aeration rate' } },
      { actionType: RuleActionType.LOG_EVENT,                  executionOrder: 3 },
    ],
  },
  {
    code:        'RULE_MLSS_OUT_OF_RANGE',
    name:        'MLSS Outside Optimal Range',
    description: 'Alert when mixed liquor suspended solids fall outside 2000–5000 mg/L.',
    category:    RuleCategory.OPERATIONAL,
    severity:    RuleSeverity.MEDIUM,
    enabled:     true,
    conditions:  [
      { field: 'parameter.code', operator: RuleOperator.EQUALS, value: 'MLSS' },
    ],
    actions:     [
      { actionType: RuleActionType.RAISE_ALERT,             executionOrder: 1 },
      { actionType: RuleActionType.GENERATE_RECOMMENDATION, executionOrder: 2 },
    ],
  },
  // ── Maintenance rules ─────────────────────────────────────────────────────
  {
    code:        'RULE_SENSOR_CALIBRATION_DUE',
    name:        'Sensor Calibration Due',
    description: 'Create a maintenance work order when a sensor calibration date is overdue.',
    category:    RuleCategory.MAINTENANCE,
    severity:    RuleSeverity.LOW,
    enabled:     true,
    conditions:  [
      { field: 'sensor.calibrationStatus', operator: RuleOperator.IN, value: ['DUE', 'EXPIRED'] },
    ],
    actions:     [
      { actionType: RuleActionType.CREATE_WORK_ORDER,  executionOrder: 1, configuration: { maintenanceType: 'CALIBRATION' } },
      { actionType: RuleActionType.SEND_NOTIFICATION,  executionOrder: 2 },
      { actionType: RuleActionType.LOG_EVENT,          executionOrder: 3 },
    ],
  },
  {
    code:        'RULE_DEVICE_OFFLINE',
    name:        'Device Offline Alert',
    description: 'Alert when a device has not sent a heartbeat for more than 5 minutes.',
    category:    RuleCategory.MAINTENANCE,
    severity:    RuleSeverity.HIGH,
    enabled:     true,
    conditions:  [
      { field: 'device.communicationStatus', operator: RuleOperator.EQUALS, value: 'OFFLINE' },
    ],
    actions:     [
      { actionType: RuleActionType.RAISE_ALERT,       executionOrder: 1, configuration: { severity: 'HIGH' } },
      { actionType: RuleActionType.SEND_NOTIFICATION, executionOrder: 2 },
    ],
  },
  // ── AI guardrails ─────────────────────────────────────────────────────────
  {
    code:        'RULE_AI_LOW_CONFIDENCE',
    name:        'AI Prediction Low Confidence',
    description: 'Block AI recommendation when model confidence score is below 70%.',
    category:    RuleCategory.AI_GUARDRAIL,
    severity:    RuleSeverity.MEDIUM,
    enabled:     true,
    conditions:  [
      { field: 'prediction.confidenceScore', operator: RuleOperator.LESS_THAN, value: 0.70 },
    ],
    actions:     [
      { actionType: RuleActionType.BLOCK_RECOMMENDATION, executionOrder: 1 },
      { actionType: RuleActionType.REQUIRE_APPROVAL,     executionOrder: 2, configuration: { notifyRoles: ['PLANT_MANAGER'] } },
      { actionType: RuleActionType.LOG_EVENT,            executionOrder: 3 },
    ],
  },
];
