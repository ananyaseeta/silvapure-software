/**
 * AI Model Seed Data
 *
 * Platform-level AI model definitions seeded at startup.
 * Matches AIModel: { code @unique, name, description?, type, isEnabled,
 *   explainabilityMethod, supportsExplainability, supportsRecommendations, supportsFeedbackLearning }
 *
 * No AIModelVersion is seeded here — versions are created by the MLOps pipeline.
 */

import {
  AIModelType, AIExplainabilityMethod,
} from '@prisma/client';

export interface AIModelSeedData {
  code:                     string;
  name:                     string;
  description:              string;
  type:                     AIModelType;
  isEnabled:                boolean;
  explainabilityMethod:     AIExplainabilityMethod;
  supportsExplainability:   boolean;
  supportsRecommendations:  boolean;
  supportsFeedbackLearning: boolean;
}

export const aiModels: AIModelSeedData[] = [
  {
    code:                     'MODEL_PLANT_HEALTH',
    name:                     'Plant Health Scoring Model',
    description:              'Composite scoring model that aggregates telemetry, alert, compliance, and maintenance signals into a plant health index (0–100).',
    type:                     AIModelType.PLANT_HEALTH,
    isEnabled:                true,
    explainabilityMethod:     AIExplainabilityMethod.SHAP,
    supportsExplainability:   true,
    supportsRecommendations:  true,
    supportsFeedbackLearning: false,
  },
  {
    code:                     'MODEL_WATER_QUALITY',
    name:                     'Water Quality Prediction Model',
    description:              'Predicts effluent parameter values (BOD, COD, TSS, pH) for the next 1–24 hours based on inlet conditions and process telemetry.',
    type:                     AIModelType.WATER_QUALITY,
    isEnabled:                true,
    explainabilityMethod:     AIExplainabilityMethod.SHAP,
    supportsExplainability:   true,
    supportsRecommendations:  true,
    supportsFeedbackLearning: true,
  },
  {
    code:                     'MODEL_PREDICTIVE_MAINTENANCE',
    name:                     'Predictive Maintenance Model',
    description:              'Estimates remaining useful life (RUL) of devices and sensors to schedule preventive maintenance and avoid unplanned failures.',
    type:                     AIModelType.PREDICTIVE_MAINTENANCE,
    isEnabled:                true,
    explainabilityMethod:     AIExplainabilityMethod.SHAP,
    supportsExplainability:   true,
    supportsRecommendations:  true,
    supportsFeedbackLearning: true,
  },
  {
    code:                     'MODEL_ANOMALY_DETECTION',
    name:                     'Anomaly Detection Model',
    description:              'Unsupervised model for detecting sensor anomalies, data drift, and process deviations in real-time telemetry streams.',
    type:                     AIModelType.ANOMALY_DETECTION,
    isEnabled:                true,
    explainabilityMethod:     AIExplainabilityMethod.LIME,
    supportsExplainability:   true,
    supportsRecommendations:  false,
    supportsFeedbackLearning: false,
  },
];
