# Predictive Maintenance Model

## Problem Definition

The Predictive Maintenance model estimates the likelihood of equipment failure within a defined future time window and, where sufficient data exists, estimates the Remaining Useful Life (RUL) of devices. This enables the SILVAPURE platform to generate `Maintenance` work orders proactively before failures occur.

This is both a **binary classification problem** (will this device fail within the next N days?) and a **regression problem** (how many operational hours remain before failure?).

**Target equipment types in SILVAPURE:**
- Submersible wastewater pumps
- Air blowers and aeration compressors
- UV disinfection lamps
- Filter press and belt press mechanisms
- Mixers and agitators
- Chemical dosing pumps

---

## Inputs

### From SILVAPURE Telemetry (production phase)
- Device operational hours (cumulative runtime)
- Vibration amplitude and frequency (if vibration sensor attached)
- Motor current draw (anomaly in current signals pump bearing wear)
- Operating temperature
- Flow rate deviation from rated capacity
- Pressure differential across filters/membranes
- Last maintenance date and type
- Historical maintenance records (breakdowns, replacements)
- Sensor calibration status and last calibration date

### From Proxy Datasets (research phase)
- UCI AI4I 2020: machine failure classification (primary proxy)
- NASA CMAPSS: RUL regression methodology (primary RUL proxy)

---

## Target Variables

### Classification Target
`FailureWithin_N_Days` (binary: 1 = failure within N days, 0 = no failure)
- N is configurable per device type (e.g., 7 days for pumps, 30 days for UV lamps)

### Regression Target
`RemainingUsefulLife` (continuous, in operational hours or days)

---

## Candidate Algorithms

| Algorithm | Task | Notes |
|---|---|---|
| XGBoost | Classification (failure prediction) | Strong baseline; handles class imbalance with `scale_pos_weight` |
| LightGBM | Classification | Efficient on large tabular feature sets |
| Random Forest | Classification | Robust baseline; natural OOB validation |
| CatBoost | Classification | Handles categorical device metadata well |
| LSTM | RUL regression | Captures sequential degradation trajectory |
| Temporal Fusion Transformer | Multi-horizon maintenance prediction | Multi-device, multi-horizon capability |
| Survival Analysis (Cox PH) | RUL estimation | Time-to-event modelling; does not require failure to have occurred |

---

## Preprocessing

1. Align operational records to a common time base per device unit
2. Compute cumulative operational hours from `Telemetry.recordedAt` and device status flags
3. Handle class imbalance: failure events are rare (expected < 5% of records). Use:
   - SMOTE oversampling on training set only
   - Class weight adjustment in model training
   - Precision-Recall curve as primary evaluation (not ROC-AUC)
4. Normalise continuous features per device type (different devices have different operational ranges)
5. For RUL estimation: cap maximum RUL label at a configured upper bound (piecewise linear RUL, common in CMAPSS literature)

---

## Feature Engineering

### Degradation Indicators
- Cumulative runtime since last maintenance event
- Rate of change of key operational parameters (temperature, current, vibration)
- Deviation from baseline operating envelope (established from first N hours of new device operation)

### Historical Features
- Mean time between failures (MTBF) for device type/model
- Number of previous maintenance events in last 90 days
- Time since last calibration
- Alert count for this device in last 30 days

### Statistical Features from Sensor Windows
- Rolling mean, std, max of motor temperature (7-day window)
- Coefficient of variation of flow rate
- Spectral features from vibration signals (if available): dominant frequency, RMS amplitude

---

## Training Strategy

### Phase 1 (Research — current)
- Use UCI AI4I 2020 for failure classification pipeline development
- Use NASA CMAPSS for RUL regression methodology and LSTM architecture validation
- Validate imbalanced classification approaches
- Benchmark: XGBoost vs LightGBM vs Random Forest on AI4I dataset

### Phase 2 (Pilot)
- Collect at least 12 months of device operational data from pilot plants
- Label historical failures from `Maintenance` records with type `CORRECTIVE`
- Train initial failure classification model per device category

### Phase 3 (Production)
- Per-device-type model fine-tuning
- Fleet learning: pool data across all SILVAPURE deployments (same device model/make)
- Maintenance record feedback loop: completed maintenance records update training labels

---

## Validation

- Chronological split: train on first 70% of each device's operational history, validate on last 30%
- For fleet models: leave-one-plant-out cross-validation
- Evaluate at multiple prediction horizons: 7-day, 14-day, 30-day

---

## Evaluation Metrics

- Precision and Recall at defined operating threshold
- F1 score (failure class)
- Area under Precision-Recall Curve (AUPRC) — preferred over ROC-AUC for imbalanced classes
- MAE for RUL regression
- Lead time: mean days warning before actual failure (business metric)
- Maintenance savings rate (estimated): requires domain-expert input on cost models

See `training/evaluation-metrics.md` for full definitions.

---

## Explainability

- SHAP TreeSHAP for all tree-based models
- Each generated `Maintenance` work order should include top 3 SHAP features driving the prediction
- The `AIRecommendation` SILVAPURE schema field `executionOrder` maps to priority; SHAP values inform the `configuration` field

---

## Limitations

- Wastewater pumps and blowers degrade very differently from jet engines (NASA CMAPSS) or manufacturing tools (AI4I). Domain adaptation is required.
- Rare failure events mean models trained on small fleets will have high variance. Minimum fleet size before model is reliable is UNVERIFIED — collect data before setting thresholds.
- Vibration-based degradation monitoring requires additional hardware not confirmed in SILVAPURE current sensor spec.
- RUL estimation requires devices to run to failure during data collection. Planned preventive maintenance programmes make genuine failure data sparse.

---

## Data Requirements

See `data-requirements/SILVAPURE-telemetry-requirements.md` Section C.

---

## Public Dataset Mapping

| Dataset | Role |
|---|---|
| UCI AI4I 2020 | Primary proxy for failure classification development (synthetic) |
| NASA CMAPSS | Primary proxy for RUL regression methodology (simulated) |
| PHM Society challenges | Secondary reference for rotating equipment (access-restricted; check per challenge) |
