# Water Quality Prediction Model

## Problem Definition

The Water Quality Prediction model forecasts effluent parameter values at the treatment plant outlet for a future time horizon (1–24 hours ahead), given current and historical inlet conditions and process measurements. This enables plant operators to anticipate compliance violations before they occur and adjust treatment processes proactively.

This is a **multivariate time-series regression problem**. One model per target parameter, or a multi-output model predicting several parameters simultaneously.

**Primary prediction targets (effluent):**
- BOD₅ (Biochemical Oxygen Demand, mg/L)
- COD (Chemical Oxygen Demand, mg/L)
- TSS (Total Suspended Solids, mg/L)
- pH
- DO (Dissolved Oxygen, mg/L) — where applicable at outlet

---

## Inputs

### From SILVAPURE Telemetry (production phase)
- Inlet parameter readings: pH, BOD, COD, TSS, flow rate, temperature
- In-process readings: MLSS, DO in aeration tank, SVI, recycle flow rates
- Treatment plant configuration: HRT, SRT, operational capacity
- Environmental data if available: ambient temperature, seasonality
- Historical effluent readings (autoregressive)

### From Proxy Datasets (research phase)
- UCI Water Treatment Plant: 38 features across treatment stages, daily resolution
- EPA Water Quality Portal: parameter co-variation patterns
- data.gov.in: India-specific parameter ranges and seasonal patterns

---

## Target Variables

| Parameter | Unit | CPCB Standard (inland water) |
|---|---|---|
| BOD₅ | mg/L | ≤ 30 mg/L |
| COD | mg/L | ≤ 250 mg/L |
| TSS | mg/L | ≤ 100 mg/L |
| pH | — | 6.0–9.0 |
| DO | mg/L | ≥ 4.0 mg/L |

Note: Standards listed are from CPCB General Standards for discharge into inland surface water (Schedule VI, Environment Protection Rules, 1986 as amended). Verify current applicable standards with a qualified environmental engineer.

---

## Candidate Algorithms

| Algorithm | Forecast Horizon | Notes |
|---|---|---|
| XGBoost (tabular with lag features) | Short (1–6h) | Strong baseline; interpretable via SHAP |
| LightGBM (tabular with lag features) | Short (1–6h) | Faster; handles high-cardinality features |
| LSTM | Medium (6–24h) | Captures sequential dependencies; requires sufficient history |
| Temporal Fusion Transformer (TFT) | Medium–Long (6–48h) | State of the art for multi-horizon tabular time series; requires PyTorch Forecasting |
| SARIMA/ARIMAX | Short (baseline) | Statistical baseline; no training data required |

---

## Preprocessing

1. Verify units — all parameters must be in consistent units before merging sources
2. Impute missing values using forward-fill (maximum 4 hours gap) or linear interpolation
3. Remove records where more than 30% of features are missing
4. Normalise using training-set statistics only (StandardScaler per feature)
5. For tree models: construct lag features (t-1 through t-24 for hourly data)
6. For sequence models: construct sliding windows of length W (tune: 24–168 hours)

---

## Feature Engineering

### Lag Features
- t-1, t-3, t-6, t-12, t-24 readings for each parameter (for tabular models)

### Rolling Statistics
- 6h, 24h, 7d rolling mean, std, min, max per parameter

### Process Efficiency Features
- BOD removal rate: (BOD_inlet - BOD_process) / BOD_inlet
- COD/BOD ratio (biodegradability index)
- Hydraulic Retention Time estimate from flow and volume

### Temporal Features
- Hour of day, day of week (operational patterns often follow these)
- Monsoon season indicator (India-specific: June–September)

### Exceedance Features
- Hours since last BOD exceedance
- Rolling compliance rate (last 7 days)

---

## Training Strategy

### Phase 1 (Research — current)
- Use UCI WTP dataset (DBO_E as proxy for BOD_E, DQO_E for COD_E)
- Validate preprocessing pipeline and sequence architectures
- Compare LSTM, XGBoost+lags, SARIMA baselines
- Establish benchmark RMSE on UCI WTP hold-out

### Phase 2 (Pilot)
- Collect minimum 180 days of continuous SILVAPURE telemetry
- Retrain on SILVAPURE data
- Evaluate against CPCB threshold violation prediction accuracy

### Phase 3 (Production)
- Per-plant fine-tuning (treatment plant type, configuration, feedstock)
- Rolling retraining on recent 90-day windows
- Concept drift monitoring

---

## Validation

- Chronological train/validation/test split (no random shuffle)
- Walk-forward validation with expanding window
- Evaluate at multiple forecast horizons: 1h, 6h, 12h, 24h

---

## Evaluation Metrics

- RMSE (Root Mean Squared Error) per parameter
- MAE (Mean Absolute Error)
- MAPE (Mean Absolute Percentage Error) — caution with near-zero values
- CPCB Exceedance Detection Rate: sensitivity for predicting standard violations
- False Alarm Rate: specificity for no-exceedance cases

See `training/evaluation-metrics.md` for full metric definitions.

---

## Explainability

- SHAP TreeSHAP for XGBoost/LightGBM: identify which inlet parameters most influence effluent predictions
- SHAP DeepExplainer or GradientExplainer for LSTM/TFT
- The SILVAPURE `AIRecommendation` model should surface the top contributing features in operator recommendations

---

## Limitations

- UCI WTP dataset has daily resolution only. Sub-daily process dynamics are not captured.
- European plant configuration (UCI) differs from Indian ETP/STP configurations
- Model accuracy cannot be quoted until SILVAPURE telemetry is available
- Seasonal effects (especially monsoon in India) require at least 2 years of data for reliable seasonal modelling
- CPCB standards referenced are general discharge standards; site-specific conditions may require different thresholds

---

## Data Requirements

See `data-requirements/SILVAPURE-telemetry-requirements.md` Section B for the complete telemetry specification.

---

## Public Dataset Mapping

| Dataset | Role |
|---|---|
| UCI Water Treatment Plant | Primary proxy for time-series effluent prediction research |
| EPA Water Quality Portal | Parameter distribution and co-variation reference |
| data.gov.in CPCB | Indian regulatory context and parameter value ranges |
| Kaggle water quality | Not recommended — unclear provenance |
