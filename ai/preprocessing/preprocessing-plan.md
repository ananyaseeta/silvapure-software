# Preprocessing Plan

## Overview

This document defines the shared preprocessing methodology for all four SILVAPURE AI models. Each model-specific document (`models/*.md`) references this plan for the shared components and describes only model-specific variations.

---

## 1. Data Sources

### 1A. Public Proxy Data (current research phase)
Raw files downloaded from approved sources (UCI, EPA, data.gov.in, NASA) are stored locally in a gitignored `data/raw/` directory. They are never committed to this repository.

### 1B. SILVAPURE Real Telemetry (future production phase)
Data is exported from the SILVAPURE PostgreSQL database via Prisma queries. The schema for the relevant tables is defined in `backend/prisma/schema.prisma`. Key tables:
- `Telemetry` — sensor readings (sensorId, value, quality, source, recordedAt)
- `Sensor` — sensor metadata (sensorTypeId, parameterId, sensorCode, calibrationStatus)
- `Device` / `Controller` — device hierarchy
- `WaterSample` / `WaterQualityMeasurement` — lab sample results
- `Alert` — historical alerts per treatment plant
- `Maintenance` — maintenance records

---

## 2. Common Pipeline Steps

All models share the following preprocessing stages in sequence.

### Step 1: Data Loading and Schema Validation
- Verify column names, data types, and expected value ranges match the source schema
- Log and reject any rows with schema violations before processing begins
- For UCI WTP: note that `?` represents missing values — convert to `NaN` before any numeric processing

### Step 2: Temporal Ordering
- Sort all time-series data by timestamp ascending before any other operation
- Verify monotonically increasing timestamps within each entity (sensor, device, plant)
- Flag and handle timestamp duplicates: keep the record with higher data completeness; log duplicates

### Step 3: Missing Value Handling
Policy by missingness mechanism:

| Mechanism | Handling Policy |
|---|---|
| Sensor offline (communication loss) | Forward-fill up to configurable max gap (default: 60 min); beyond gap, mark as `IMPUTED_MISSING` |
| Sensor fault (status = FAULT or CALIBRATION) | Do not impute; mark as `SENSOR_FAULT`; exclude from training if fault duration > 4h |
| Random/unknown | Linear interpolation for gaps ≤ 30 min; median imputation for gaps 30 min–4h; exclude for gaps > 4h |
| Structural (feature never collected for this sensor) | Exclude feature from model or use indicator variable |

**Critical rule:** Never impute missing values using information from the validation or test set. Compute imputation statistics (medians, last valid value) on the training set only.

### Step 4: Outlier Handling
- Compute training-set mean and std per feature per entity
- Flag values beyond ±3σ as potential outliers
- Do NOT automatically remove outliers — log them and review
- For anomaly detection: outliers are the signal; do not remove them from the evaluation set
- For water quality prediction: clip to ±4σ range (extreme outliers likely sensor errors)

### Step 5: Unit Normalisation
Before merging datasets or features, ensure all measurements are in consistent units:

| Parameter | Required Unit |
|---|---|
| pH | Dimensionless (0–14) |
| BOD, COD, TSS, TDS | mg/L |
| DO | mg/L |
| Turbidity | NTU |
| Flow rate | m³/hr (SILVAPURE schema unit) |
| Temperature | °C |
| Conductivity | µS/cm |
| Pressure | bar or kPa (specify per model) |

### Step 6: Feature Scaling
Two strategies used depending on model type:

| Model Type | Scaling Strategy |
|---|---|
| Tree-based (XGBoost, LightGBM, Random Forest) | No scaling required; tree splits are invariant to monotone transforms |
| Neural network (LSTM, Autoencoder, TFT) | StandardScaler (zero mean, unit variance) per feature, fit on training set only |
| Distance-based (LOF, DBSCAN, Isolation Forest) | StandardScaler required — distance metrics are sensitive to scale |
| Statistical baseline (SARIMA) | Differencing as required; no explicit scaling |

**Rule:** Fit all scalers on the training set. Apply the fitted scaler to validation and test sets without refitting.

### Step 7: Temporal Feature Construction

#### For Tabular Models (XGBoost, LightGBM, Random Forest)
Lag features are required since these models have no inherent temporal memory:
- Lag depths: [1, 3, 6, 12, 24] timesteps (tune per dataset)
- Rolling statistics: mean, std, min, max over [6, 24, 168] timestep windows per feature

#### For Sequence Models (LSTM, TFT, Autoencoder)
- Construct sliding windows of length W (hyperparameter, typical range: 24–168 for hourly data)
- Stride S (typically 1 for training, larger for efficient inference)
- For prediction tasks: forecast horizon H (predict H steps ahead)

### Step 8: Train/Validation/Test Split
**Never use random shuffling for time-series data.**

See `training/data-splitting.md` for the full splitting strategy.

### Step 9: Class Imbalance Handling (Classification Tasks Only)
Applies to: Predictive Maintenance failure classification, Anomaly Detection (if labelled data available)

Strategy (apply to training set only — never to validation or test):
1. Compute class ratio in training set
2. If minority class < 10%: apply SMOTE with k=5 neighbours
3. If minority class 10–30%: use class weights in model loss function
4. Always evaluate on the original unbalanced test set

---

## 3. Data Leakage Prevention

The following rules prevent data leakage in all SILVAPURE models:

1. All preprocessing statistics (means, std, scaler parameters, imputation values) are computed on the training split only
2. No feature that encodes future information is used as a model input
3. No target-encoded features that use the full dataset statistics
4. Validation and test sets are held out before any preprocessing is applied
5. Alert and maintenance labels are applied using only information available before the prediction timestamp

---

## 4. Reproducibility Requirements

Every preprocessing run must produce a reproducible output:
- All random seeds set (Python: `random.seed(42)`, `numpy.seed(42)`, `torch.manual_seed(42)`)
- Preprocessing parameters logged to a versioned config file
- Output statistics (record counts, feature distributions before/after) logged to stderr or a log file
- Scaler objects and imputation statistics serialised to the `artifacts/` directory

---

## 5. Preprocessing for Proxy Datasets — Specific Notes

### UCI Water Treatment Plant
- Parse `?` as `np.nan` during CSV load
- Treat records as ordered daily time series (no timestamp column; row order = day order)
- Features are named generically (`V1`–`V38` in some versions) — refer to the UCI documentation for the mapping to process stages

### EPA Water Quality Portal
- Use the WQP REST API for targeted downloads (filter by state, characteristic name, date range)
- Handle the `ResultMeasure.MeasureUnitCode` column to normalise units
- Filter `ActivityTypeCode` to `Sample-Routine` or `Field Msr/Obs` for consistency

### UCI AI4I 2020
- Column `productID` is categorical (L/M/H) — encode as ordinal (0/1/2) or one-hot
- Columns TWF, HDF, PWF, OSF, RNF are individual failure mode flags — treat as multi-label targets
- No timestamps; sequential order is meaningful for tool wear analysis

### NASA CMAPSS
- No header in raw files — apply column names from the dataset documentation
- Separate training and test CSVs; test set has no RUL labels (must be computed from `RUL_*.txt`)
- Clip RUL at 125 cycles (piecewise linear approach, standard in literature)

---

## 6. Preprocessing Code Location

Preprocessing code will be developed in:
- `src/<model_name>/preprocessing.py` — model-specific preprocessing functions
- `notebooks/` — exploratory preprocessing notebooks

No preprocessing logic should reside in model training scripts. Preprocessing is a separate, independently testable stage.
