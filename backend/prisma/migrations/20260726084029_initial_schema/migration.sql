-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RoleCode" AS ENUM ('ADMIN', 'PLANT_MANAGER', 'OPERATOR', 'ENVIRONMENTAL_OFFICER', 'VIEWER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PlantType" AS ENUM ('INDUSTRIAL', 'MUNICIPAL');

-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TreatmentPlantType" AS ENUM ('STP', 'ETP', 'CETP');

-- CreateEnum
CREATE TYPE "ControllerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'FAULT');

-- CreateEnum
CREATE TYPE "DeviceCommunicationStatus" AS ENUM ('ONLINE', 'OFFLINE', 'WARNING', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DeviceCapability" AS ENUM ('TELEMETRY', 'CONTROL', 'DIAGNOSTICS', 'FIRMWARE_UPDATE');

-- CreateEnum
CREATE TYPE "CommunicationProtocol" AS ENUM ('MQTT', 'OPC_UA', 'MODBUS_TCP', 'MODBUS_RTU', 'HTTP');

-- CreateEnum
CREATE TYPE "SensorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CALIBRATION', 'FAULT');

-- CreateEnum
CREATE TYPE "CalibrationStatus" AS ENUM ('CALIBRATED', 'NOT_CALIBRATED', 'DUE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TelemetryQuality" AS ENUM ('GOOD', 'UNCERTAIN', 'BAD');

-- CreateEnum
CREATE TYPE "TelemetrySource" AS ENUM ('SENSOR', 'MANUAL', 'LAB', 'IMPORTED');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "AlertSource" AS ENUM ('TELEMETRY', 'WATER_SAMPLE', 'SYSTEM', 'MANUAL');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'CALIBRATION');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReusePurpose" AS ENUM ('IRRIGATION', 'INDUSTRIAL', 'COOLING', 'FLUSHING', 'DISCHARGE');

-- CreateEnum
CREATE TYPE "SludgeDisposalMethod" AS ENUM ('LANDFILL', 'COMPOSTING', 'INCINERATION', 'LAND_APPLICATION', 'CO_PROCESSING');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'COMPLIANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'WARNING', 'NON_COMPLIANT');

-- CreateEnum
CREATE TYPE "PassportStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PassportType" AS ENUM ('WASTEWATER', 'COMPLIANCE', 'PLANT');

-- CreateEnum
CREATE TYPE "PlantHealthStatus" AS ENUM ('HEALTHY', 'MODERATE', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AIModelType" AS ENUM ('PLANT_HEALTH', 'WATER_QUALITY', 'PREDICTIVE_MAINTENANCE', 'ANOMALY_DETECTION');

-- CreateEnum
CREATE TYPE "AIFramework" AS ENUM ('SCIKIT_LEARN', 'XGBOOST', 'PYTORCH', 'TENSORFLOW');

-- CreateEnum
CREATE TYPE "AIModelStatus" AS ENUM ('DEVELOPMENT', 'TRAINING', 'VALIDATING', 'READY', 'RETIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "AIModelDeploymentStatus" AS ENUM ('NOT_DEPLOYED', 'DEPLOYED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "AIFeedbackType" AS ENUM ('ACCEPTED', 'REJECTED', 'MODIFIED', 'NOT_USEFUL');

-- CreateEnum
CREATE TYPE "RecommendationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('GENERATED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXECUTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AIGuardrailType" AS ENUM ('DATA_VALIDATION', 'PREDICTION_CONFIDENCE', 'REGULATORY_COMPLIANCE', 'OPERATIONAL_SAFETY', 'HUMAN_APPROVAL', 'EXPLAINABILITY', 'MODEL_PERFORMANCE', 'DATA_DRIFT');

-- CreateEnum
CREATE TYPE "GuardrailSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "GuardrailStatus" AS ENUM ('PASSED', 'FLAGGED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AIInferenceStatus" AS ENUM ('SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AIExplainabilityMethod" AS ENUM ('NONE', 'SHAP', 'LIME');

-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('INTERNAL', 'OPENAI', 'AZURE_OPENAI', 'AWS_SAGEMAKER', 'GOOGLE_VERTEX_AI');

-- CreateEnum
CREATE TYPE "ModuleCode" AS ENUM ('AI', 'REPORTS', 'COMPLIANCE', 'DIGITAL_WASTEWATER_PASSPORT', 'PREDICTIVE_MAINTENANCE', 'ANALYTICS', 'DEVICE_MANAGEMENT', 'ALERTS');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('COMMUNITY', 'PROFESSIONAL', 'ENTERPRISE', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PLANTS', 'DEVICES', 'USERS', 'REPORTS', 'AI_MODELS', 'STORAGE_GB');

-- CreateEnum
CREATE TYPE "RuleCategory" AS ENUM ('AI_GUARDRAIL', 'COMPLIANCE', 'OPERATIONAL', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RuleSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RuleOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'GREATER_THAN_OR_EQUAL', 'LESS_THAN', 'LESS_THAN_OR_EQUAL', 'IN', 'NOT_IN');

-- CreateEnum
CREATE TYPE "RuleActionType" AS ENUM ('GENERATE_RECOMMENDATION', 'BLOCK_RECOMMENDATION', 'RAISE_ALERT', 'REQUIRE_APPROVAL', 'SEND_NOTIFICATION', 'CREATE_WORK_ORDER', 'LOG_EVENT');

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "code" "RoleCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "jobTitle" TEXT,
    "passwordHash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "industryTypeId" UUID NOT NULL,
    "organizationCode" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "plantCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "timezone" TEXT DEFAULT 'Asia/Kolkata',
    "plantType" "PlantType" NOT NULL DEFAULT 'INDUSTRIAL',
    "commissionedOn" TIMESTAMP(3),
    "status" "PlantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentTechnology" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentPlant" (
    "id" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "technologyId" UUID NOT NULL,
    "treatmentPlantCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TreatmentPlantType" NOT NULL,
    "designCapacityM3Day" DECIMAL(10,2),
    "operationalCapacityM3Day" DECIMAL(10,2),
    "commissionedOn" TIMESTAMP(3) NOT NULL,
    "status" "PlantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Controller" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "registeredById" UUID,
    "controllerCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "firmwareVersion" TEXT,
    "ipAddress" TEXT,
    "port" INTEGER,
    "authenticationToken" TEXT,
    "installedOn" TIMESTAMP(3),
    "lastHeartbeatAt" TIMESTAMP(3),
    "notes" TEXT,
    "status" "ControllerStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Controller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" UUID NOT NULL,
    "controllerId" UUID NOT NULL,
    "protocolAdapterId" UUID,
    "registeredById" UUID,
    "deviceCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capabilities" JSONB,
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "installationLocation" TEXT,
    "installedOn" TIMESTAMP(3),
    "ipAddress" TEXT,
    "port" INTEGER,
    "notes" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ONLINE',
    "communicationStatus" "DeviceCommunicationStatus" NOT NULL DEFAULT 'OFFLINE',
    "authenticationToken" TEXT,
    "registeredAt" TIMESTAMP(3),
    "lastHeartbeatAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorType" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parameter" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "acceptableMin" DECIMAL(12,4),
    "acceptableMax" DECIMAL(12,4),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "sensorTypeId" UUID NOT NULL,
    "parameterId" UUID NOT NULL,
    "sensorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "serialNumber" TEXT,
    "unit" TEXT,
    "minimumRange" DECIMAL(10,2),
    "maximumRange" DECIMAL(10,2),
    "samplingIntervalSeconds" INTEGER,
    "installationLocation" TEXT,
    "calibrationStatus" "CalibrationStatus" NOT NULL DEFAULT 'NOT_CALIBRATED',
    "lastCalibratedAt" TIMESTAMP(3),
    "nextCalibrationDate" TIMESTAMP(3),
    "installedOn" TIMESTAMP(3),
    "notes" TEXT,
    "status" "SensorStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Telemetry" (
    "id" UUID NOT NULL,
    "sensorId" UUID NOT NULL,
    "value" DECIMAL(12,4) NOT NULL,
    "quality" "TelemetryQuality" NOT NULL DEFAULT 'GOOD',
    "source" "TelemetrySource" NOT NULL DEFAULT 'SENSOR',
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterSample" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "collectedById" UUID NOT NULL,
    "sampleCode" TEXT NOT NULL,
    "sampleLocation" TEXT,
    "sampleSource" TEXT,
    "collectedAt" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaterSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaterQualityMeasurement" (
    "id" UUID NOT NULL,
    "sampleId" UUID NOT NULL,
    "parameterId" UUID NOT NULL,
    "analyzedById" UUID,
    "value" DECIMAL(12,4) NOT NULL,
    "remarks" TEXT,
    "analyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaterQualityMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SludgeBatch" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "generatedDate" TIMESTAMP(3) NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "disposalMethod" "SludgeDisposalMethod",
    "disposedAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SludgeBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatedWaterReuse" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "reusePurpose" "ReusePurpose" NOT NULL,
    "reuseQuantity" DECIMAL(12,2) NOT NULL,
    "reusedAt" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatedWaterReuse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "sensorId" UUID,
    "telemetryId" UUID,
    "acknowledgedById" UUID,
    "resolvedById" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "source" "AlertSource" NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "performedById" UUID,
    "maintenanceType" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3),
    "performedDate" TIMESTAMP(3),
    "description" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "generatedById" UUID NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRecord" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "reportId" UUID,
    "evaluatedById" UUID,
    "overallStatus" "ComplianceStatus" NOT NULL,
    "complianceScore" DECIMAL(5,2) NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalWastewaterPassport" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "reportId" UUID,
    "passportNumber" TEXT NOT NULL,
    "passportType" "PassportType" NOT NULL,
    "status" "PassportStatus" NOT NULL,
    "validUntil" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "filePath" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalWastewaterPassport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantHealthAssessment" (
    "id" UUID NOT NULL,
    "treatmentPlantId" UUID NOT NULL,
    "telemetryScore" DECIMAL(5,2),
    "maintenanceScore" DECIMAL(5,2),
    "complianceScore" DECIMAL(5,2),
    "alertScore" DECIMAL(5,2),
    "healthStatus" "PlantHealthStatus" NOT NULL,
    "evaluatedAt" TIMESTAMP(3) NOT NULL,
    "recommendation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantHealthAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtocolAdapter" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "protocol" "CommunicationProtocol" NOT NULL,
    "version" TEXT,
    "endpoint" TEXT,
    "port" INTEGER,
    "configuration" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProtocolAdapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" UUID NOT NULL,
    "code" "ModuleCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationModule" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "activatedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "planType" "PlanType" NOT NULL,
    "price" DECIMAL(12,2),
    "billingCycle" "BillingCycle" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanModule" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "moduleId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PlanModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationSubscription" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanLimit" (
    "id" UUID NOT NULL,
    "planId" UUID NOT NULL,
    "resource" "ResourceType" NOT NULL,
    "limit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "RuleCategory" NOT NULL,
    "severity" "RuleSeverity" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleCondition" (
    "id" UUID NOT NULL,
    "ruleId" UUID NOT NULL,
    "field" TEXT NOT NULL,
    "operator" "RuleOperator" NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "RuleCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleAction" (
    "id" UUID NOT NULL,
    "ruleId" UUID NOT NULL,
    "actionType" "RuleActionType" NOT NULL,
    "executionOrder" INTEGER NOT NULL DEFAULT 1,
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RuleAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModel" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AIModelType" NOT NULL,
    "activeVersionId" UUID,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "explainabilityMethod" "AIExplainabilityMethod" NOT NULL DEFAULT 'SHAP',
    "supportsExplainability" BOOLEAN NOT NULL DEFAULT true,
    "supportsRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "supportsFeedbackLearning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIModelVersion" (
    "id" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "deployedById" UUID,
    "rollbackVersionId" UUID,
    "version" TEXT NOT NULL,
    "framework" "AIFramework" NOT NULL,
    "frameworkVersion" TEXT,
    "provider" "AIProvider" NOT NULL DEFAULT 'INTERNAL',
    "status" "AIModelStatus" NOT NULL DEFAULT 'DEVELOPMENT',
    "deploymentStatus" "AIModelDeploymentStatus" NOT NULL DEFAULT 'NOT_DEPLOYED',
    "artifactUri" TEXT,
    "checksum" TEXT,
    "datasetName" TEXT,
    "datasetVersion" TEXT,
    "datasetSource" TEXT,
    "metrics" JSONB,
    "trainedAt" TIMESTAMP(3),
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIModelVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AITrainingJob" (
    "id" UUID NOT NULL,
    "modelVersionId" UUID,
    "datasetName" TEXT NOT NULL,
    "datasetVersion" TEXT,
    "datasetSource" TEXT,
    "framework" "AIFramework" NOT NULL,
    "status" "AIModelStatus" NOT NULL,
    "metrics" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AITrainingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConfiguration" (
    "id" UUID NOT NULL,
    "minimumConfidenceThreshold" DECIMAL(5,2) NOT NULL,
    "enableExplainability" BOOLEAN NOT NULL DEFAULT true,
    "enableRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "enableGuardrails" BOOLEAN NOT NULL DEFAULT true,
    "enableFeedbackLearning" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInferenceLog" (
    "id" UUID NOT NULL,
    "modelVersionId" UUID NOT NULL,
    "predictionId" UUID,
    "latencyMs" INTEGER NOT NULL,
    "status" "AIInferenceStatus" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInferenceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPrediction" (
    "id" UUID NOT NULL,
    "modelVersionId" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "deviceId" UUID,
    "predictionType" "AIModelType" NOT NULL,
    "predictionValue" JSONB NOT NULL,
    "confidenceScore" DECIMAL(5,2),
    "inputSnapshot" JSONB,
    "processingTimeMs" INTEGER,
    "predictedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPrediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIPredictionExplanation" (
    "id" UUID NOT NULL,
    "predictionId" UUID NOT NULL,
    "featureName" TEXT NOT NULL,
    "featureValue" JSONB,
    "shapValue" DECIMAL(12,6) NOT NULL,
    "importanceRank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIPredictionExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIRecommendation" (
    "id" UUID NOT NULL,
    "predictionId" UUID NOT NULL,
    "plantId" UUID NOT NULL,
    "approvedById" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "RecommendationPriority" NOT NULL,
    "status" "RecommendationStatus" NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIFeedback" (
    "id" UUID NOT NULL,
    "predictionId" UUID NOT NULL,
    "recommendationId" UUID,
    "operatorId" UUID NOT NULL,
    "feedback" "AIFeedbackType" NOT NULL,
    "comments" TEXT,
    "actualOutcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIGuardrailLog" (
    "id" UUID NOT NULL,
    "predictionId" UUID,
    "recommendationId" UUID,
    "guardrailType" "AIGuardrailType" NOT NULL,
    "severity" "GuardrailSeverity" NOT NULL,
    "status" "GuardrailStatus" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIGuardrailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_readAt_idx" ON "Notification"("readAt");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryType_name_key" ON "IndustryType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_organizationCode_key" ON "Organization"("organizationCode");

-- CreateIndex
CREATE INDEX "Organization_industryTypeId_idx" ON "Organization"("industryTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Plant_plantCode_key" ON "Plant"("plantCode");

-- CreateIndex
CREATE INDEX "Plant_organizationId_idx" ON "Plant"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentTechnology_name_key" ON "TreatmentTechnology"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentPlant_treatmentPlantCode_key" ON "TreatmentPlant"("treatmentPlantCode");

-- CreateIndex
CREATE INDEX "TreatmentPlant_plantId_idx" ON "TreatmentPlant"("plantId");

-- CreateIndex
CREATE INDEX "TreatmentPlant_technologyId_idx" ON "TreatmentPlant"("technologyId");

-- CreateIndex
CREATE UNIQUE INDEX "Controller_controllerCode_key" ON "Controller"("controllerCode");

-- CreateIndex
CREATE INDEX "Controller_treatmentPlantId_idx" ON "Controller"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "Controller_registeredById_idx" ON "Controller"("registeredById");

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceCode_key" ON "Device"("deviceCode");

-- CreateIndex
CREATE INDEX "Device_controllerId_idx" ON "Device"("controllerId");

-- CreateIndex
CREATE INDEX "Device_protocolAdapterId_idx" ON "Device"("protocolAdapterId");

-- CreateIndex
CREATE INDEX "Device_registeredById_idx" ON "Device"("registeredById");

-- CreateIndex
CREATE UNIQUE INDEX "SensorType_code_key" ON "SensorType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Parameter_code_key" ON "Parameter"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Sensor_sensorCode_key" ON "Sensor"("sensorCode");

-- CreateIndex
CREATE INDEX "Sensor_deviceId_idx" ON "Sensor"("deviceId");

-- CreateIndex
CREATE INDEX "Sensor_sensorTypeId_idx" ON "Sensor"("sensorTypeId");

-- CreateIndex
CREATE INDEX "Sensor_parameterId_idx" ON "Sensor"("parameterId");

-- CreateIndex
CREATE INDEX "Telemetry_sensorId_idx" ON "Telemetry"("sensorId");

-- CreateIndex
CREATE INDEX "Telemetry_recordedAt_idx" ON "Telemetry"("recordedAt");

-- CreateIndex
CREATE INDEX "Telemetry_sensorId_recordedAt_idx" ON "Telemetry"("sensorId", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaterSample_sampleCode_key" ON "WaterSample"("sampleCode");

-- CreateIndex
CREATE INDEX "WaterSample_treatmentPlantId_idx" ON "WaterSample"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "WaterSample_collectedById_idx" ON "WaterSample"("collectedById");

-- CreateIndex
CREATE INDEX "WaterQualityMeasurement_sampleId_idx" ON "WaterQualityMeasurement"("sampleId");

-- CreateIndex
CREATE INDEX "WaterQualityMeasurement_parameterId_idx" ON "WaterQualityMeasurement"("parameterId");

-- CreateIndex
CREATE INDEX "WaterQualityMeasurement_analyzedById_idx" ON "WaterQualityMeasurement"("analyzedById");

-- CreateIndex
CREATE UNIQUE INDEX "SludgeBatch_batchNumber_key" ON "SludgeBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "SludgeBatch_treatmentPlantId_idx" ON "SludgeBatch"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "TreatedWaterReuse_treatmentPlantId_idx" ON "TreatedWaterReuse"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "Alert_treatmentPlantId_idx" ON "Alert"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "Alert_sensorId_idx" ON "Alert"("sensorId");

-- CreateIndex
CREATE INDEX "Alert_telemetryId_idx" ON "Alert"("telemetryId");

-- CreateIndex
CREATE INDEX "Alert_status_severity_idx" ON "Alert"("status", "severity");

-- CreateIndex
CREATE INDEX "Alert_treatmentPlantId_status_idx" ON "Alert"("treatmentPlantId", "status");

-- CreateIndex
CREATE INDEX "Maintenance_deviceId_idx" ON "Maintenance"("deviceId");

-- CreateIndex
CREATE INDEX "Maintenance_performedById_idx" ON "Maintenance"("performedById");

-- CreateIndex
CREATE INDEX "Maintenance_status_idx" ON "Maintenance"("status");

-- CreateIndex
CREATE INDEX "Report_treatmentPlantId_idx" ON "Report"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "Report_generatedById_idx" ON "Report"("generatedById");

-- CreateIndex
CREATE INDEX "ComplianceRecord_treatmentPlantId_idx" ON "ComplianceRecord"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "ComplianceRecord_evaluatedAt_idx" ON "ComplianceRecord"("evaluatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalWastewaterPassport_passportNumber_key" ON "DigitalWastewaterPassport"("passportNumber");

-- CreateIndex
CREATE INDEX "DigitalWastewaterPassport_treatmentPlantId_idx" ON "DigitalWastewaterPassport"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "DigitalWastewaterPassport_status_idx" ON "DigitalWastewaterPassport"("status");

-- CreateIndex
CREATE INDEX "PlantHealthAssessment_treatmentPlantId_idx" ON "PlantHealthAssessment"("treatmentPlantId");

-- CreateIndex
CREATE INDEX "PlantHealthAssessment_evaluatedAt_idx" ON "PlantHealthAssessment"("evaluatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolAdapter_code_key" ON "ProtocolAdapter"("code");

-- CreateIndex
CREATE INDEX "ProtocolAdapter_protocol_idx" ON "ProtocolAdapter"("protocol");

-- CreateIndex
CREATE UNIQUE INDEX "Module_code_key" ON "Module"("code");

-- CreateIndex
CREATE INDEX "OrganizationModule_organizationId_idx" ON "OrganizationModule"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationModule_organizationId_moduleId_key" ON "OrganizationModule"("organizationId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_code_key" ON "SubscriptionPlan"("code");

-- CreateIndex
CREATE INDEX "PlanModule_planId_idx" ON "PlanModule"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanModule_planId_moduleId_key" ON "PlanModule"("planId", "moduleId");

-- CreateIndex
CREATE INDEX "OrganizationSubscription_organizationId_idx" ON "OrganizationSubscription"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationSubscription_status_idx" ON "OrganizationSubscription"("status");

-- CreateIndex
CREATE INDEX "PlanLimit_planId_idx" ON "PlanLimit"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimit_planId_resource_key" ON "PlanLimit"("planId", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_code_key" ON "Rule"("code");

-- CreateIndex
CREATE INDEX "RuleCondition_ruleId_idx" ON "RuleCondition"("ruleId");

-- CreateIndex
CREATE INDEX "RuleAction_ruleId_idx" ON "RuleAction"("ruleId");

-- CreateIndex
CREATE UNIQUE INDEX "AIModel_code_key" ON "AIModel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AIModel_activeVersionId_key" ON "AIModel"("activeVersionId");

-- CreateIndex
CREATE INDEX "AIModel_type_idx" ON "AIModel"("type");

-- CreateIndex
CREATE INDEX "AIModel_isEnabled_idx" ON "AIModel"("isEnabled");

-- CreateIndex
CREATE INDEX "AIModelVersion_modelId_idx" ON "AIModelVersion"("modelId");

-- CreateIndex
CREATE INDEX "AIModelVersion_status_idx" ON "AIModelVersion"("status");

-- CreateIndex
CREATE INDEX "AIModelVersion_framework_idx" ON "AIModelVersion"("framework");

-- CreateIndex
CREATE UNIQUE INDEX "AIModelVersion_modelId_version_key" ON "AIModelVersion"("modelId", "version");

-- CreateIndex
CREATE INDEX "AITrainingJob_modelVersionId_idx" ON "AITrainingJob"("modelVersionId");

-- CreateIndex
CREATE INDEX "AITrainingJob_status_idx" ON "AITrainingJob"("status");

-- CreateIndex
CREATE INDEX "AIInferenceLog_modelVersionId_idx" ON "AIInferenceLog"("modelVersionId");

-- CreateIndex
CREATE INDEX "AIInferenceLog_predictionId_idx" ON "AIInferenceLog"("predictionId");

-- CreateIndex
CREATE INDEX "AIInferenceLog_createdAt_idx" ON "AIInferenceLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIPrediction_plantId_idx" ON "AIPrediction"("plantId");

-- CreateIndex
CREATE INDEX "AIPrediction_modelVersionId_idx" ON "AIPrediction"("modelVersionId");

-- CreateIndex
CREATE INDEX "AIPrediction_predictedAt_idx" ON "AIPrediction"("predictedAt");

-- CreateIndex
CREATE INDEX "AIPrediction_predictionType_idx" ON "AIPrediction"("predictionType");

-- CreateIndex
CREATE INDEX "AIPredictionExplanation_predictionId_idx" ON "AIPredictionExplanation"("predictionId");

-- CreateIndex
CREATE INDEX "AIPredictionExplanation_featureName_idx" ON "AIPredictionExplanation"("featureName");

-- CreateIndex
CREATE UNIQUE INDEX "AIRecommendation_predictionId_key" ON "AIRecommendation"("predictionId");

-- CreateIndex
CREATE INDEX "AIRecommendation_plantId_idx" ON "AIRecommendation"("plantId");

-- CreateIndex
CREATE INDEX "AIRecommendation_status_idx" ON "AIRecommendation"("status");

-- CreateIndex
CREATE INDEX "AIFeedback_predictionId_idx" ON "AIFeedback"("predictionId");

-- CreateIndex
CREATE INDEX "AIFeedback_operatorId_idx" ON "AIFeedback"("operatorId");

-- CreateIndex
CREATE INDEX "AIGuardrailLog_guardrailType_idx" ON "AIGuardrailLog"("guardrailType");

-- CreateIndex
CREATE INDEX "AIGuardrailLog_severity_idx" ON "AIGuardrailLog"("severity");

-- CreateIndex
CREATE INDEX "AIGuardrailLog_status_idx" ON "AIGuardrailLog"("status");

-- CreateIndex
CREATE INDEX "AIGuardrailLog_createdAt_idx" ON "AIGuardrailLog"("createdAt");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_industryTypeId_fkey" FOREIGN KEY ("industryTypeId") REFERENCES "IndustryType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentPlant" ADD CONSTRAINT "TreatmentPlant_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentPlant" ADD CONSTRAINT "TreatmentPlant_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "TreatmentTechnology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Controller" ADD CONSTRAINT "Controller_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Controller" ADD CONSTRAINT "Controller_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_controllerId_fkey" FOREIGN KEY ("controllerId") REFERENCES "Controller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_protocolAdapterId_fkey" FOREIGN KEY ("protocolAdapterId") REFERENCES "ProtocolAdapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_sensorTypeId_fkey" FOREIGN KEY ("sensorTypeId") REFERENCES "SensorType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "Parameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Telemetry" ADD CONSTRAINT "Telemetry_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterSample" ADD CONSTRAINT "WaterSample_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterSample" ADD CONSTRAINT "WaterSample_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterQualityMeasurement" ADD CONSTRAINT "WaterQualityMeasurement_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "WaterSample"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterQualityMeasurement" ADD CONSTRAINT "WaterQualityMeasurement_parameterId_fkey" FOREIGN KEY ("parameterId") REFERENCES "Parameter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WaterQualityMeasurement" ADD CONSTRAINT "WaterQualityMeasurement_analyzedById_fkey" FOREIGN KEY ("analyzedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SludgeBatch" ADD CONSTRAINT "SludgeBatch_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatedWaterReuse" ADD CONSTRAINT "TreatedWaterReuse_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_telemetryId_fkey" FOREIGN KEY ("telemetryId") REFERENCES "Telemetry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRecord" ADD CONSTRAINT "ComplianceRecord_evaluatedById_fkey" FOREIGN KEY ("evaluatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalWastewaterPassport" ADD CONSTRAINT "DigitalWastewaterPassport_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalWastewaterPassport" ADD CONSTRAINT "DigitalWastewaterPassport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantHealthAssessment" ADD CONSTRAINT "PlantHealthAssessment_treatmentPlantId_fkey" FOREIGN KEY ("treatmentPlantId") REFERENCES "TreatmentPlant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationModule" ADD CONSTRAINT "OrganizationModule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationModule" ADD CONSTRAINT "OrganizationModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanModule" ADD CONSTRAINT "PlanModule_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanModule" ADD CONSTRAINT "PlanModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleCondition" ADD CONSTRAINT "RuleCondition_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleAction" ADD CONSTRAINT "RuleAction_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "Rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModel" ADD CONSTRAINT "AIModel_activeVersionId_fkey" FOREIGN KEY ("activeVersionId") REFERENCES "AIModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModelVersion" ADD CONSTRAINT "AIModelVersion_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AIModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModelVersion" ADD CONSTRAINT "AIModelVersion_deployedById_fkey" FOREIGN KEY ("deployedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIModelVersion" ADD CONSTRAINT "AIModelVersion_rollbackVersionId_fkey" FOREIGN KEY ("rollbackVersionId") REFERENCES "AIModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITrainingJob" ADD CONSTRAINT "AITrainingJob_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "AIModelVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInferenceLog" ADD CONSTRAINT "AIInferenceLog_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "AIModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInferenceLog" ADD CONSTRAINT "AIInferenceLog_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "AIPrediction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPrediction" ADD CONSTRAINT "AIPrediction_modelVersionId_fkey" FOREIGN KEY ("modelVersionId") REFERENCES "AIModelVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPrediction" ADD CONSTRAINT "AIPrediction_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPrediction" ADD CONSTRAINT "AIPrediction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIPredictionExplanation" ADD CONSTRAINT "AIPredictionExplanation_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "AIPrediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "AIPrediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedback" ADD CONSTRAINT "AIFeedback_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "AIPrediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedback" ADD CONSTRAINT "AIFeedback_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AIRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIFeedback" ADD CONSTRAINT "AIFeedback_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGuardrailLog" ADD CONSTRAINT "AIGuardrailLog_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "AIPrediction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIGuardrailLog" ADD CONSTRAINT "AIGuardrailLog_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "AIRecommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
