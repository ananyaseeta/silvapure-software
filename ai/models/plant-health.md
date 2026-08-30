# Plant Health Scoring Model

## Problem Definition

The Plant Health Scoring model produces a composite score (0–100) indicating the overall operational health of a wastewater treatment plant. The score aggregates signals from telemetry, alert history, compliance records, and maintenance records into a single actionable indicator visible on the SILVAPURE operations dashboard.

This is a **composite regression/classification problem**. The output is both a numeric score and a health status category (`HEALTHY`, `MODERATE`, `CRITICAL`) as defined in the SILVAPURE Prisma schema (`PlantHealthStatus` enum).

---

## Inputs

### From SILVAPURE Telemetry (future real data)
- Effluent parameter readings: pH, DO, BOD, COD, TSS, turbidity
- Process parameter readings: flow rates, MLSS, SVI, aeration rates
- Device and sensor status indicators
- Alert severity counts (open, acknowledged, resolved) over rolling time windows
- Maintenance record status (overdue, completed on schedule, cancelled)
- Compliance record scores over the last N days
- Treatment plant operational capacity utilisation

### From Proxy Datasets (current research phase)
- UCI Water Treatment Plant: DBO_E, SS_E, DQO_E as effluent quality proxies
- data.gov.in CPCB: Indian regulatory compliance indicators
- Derived features from rolling windows

---

## Target Variable

During the SILVAPURE real-data phase, the target is the `PlantHealthAssessment` record fields:
- `healthStatus` (enum: HEALTHY / MODERATE / CRITICAL)
- `telemetryScore`, `maintenanceScore`, `complianceScore`, `alertScore` (0–100 component scores)
- Composite `healthScore` (weighted sum of components)

During the proxy/research phase, targets must be engineered from available datasets as there are no pre-labelled plant health scores in public datasets. Possible proxy targets:
- Effluent compliance binary (effluent within acceptable BOD/COD range)
- Composite anomaly score derived from process deviations

---

## Candidate Algorithms

| Algorithm | Rationale |
|---|---|
| XGBoost | Handles mixed feature types, missing values, and non-linear interactions well. Strong performance on tabular operational data. |
| LightGBM | Faster training than XGBoost on larger datasets; good for high-cardinality features |
| Random Forest | Robust baseline; natural feature importance for explainability |
| Gradient Boosted regression (scikit-learn) | Simple baseline |
| Rule-based scoring (non-ML baseline) | Current SILVAPURE schema already defines component scores; a weighted linear combination is a valid non-ML baseline to beat |

Sequence models (LSTM, TFT) are appropriate when SILVAPURE has sufficient real-time telemetry history. Not recommended for the proxy data phase due to temporal resolution mismatch.

---

## Preprocessing

1. Normalise all continuous telemetry features (zero mean, unit variance per feature, computed on training period)
2. Handle missing sensor readings: forward-fill within a configurable window, then impute with training-period median
3. Compute rolling statistics per parameter: mean, std, min, max over 1h, 6h, 24h windows
4. Encode categorical features (sensor status, maintenance status) as ordinal or one-hot
5. Clip outliers at 3σ from mean (after flagging as potential anomalies)

---

## Feature Engineering

### Component Score Features
- **Telemetry health score**: deviation of each effluent parameter from its acceptable range, normalised and weighted
- **Alert score**: rolling count of HIGH and CRITICAL alerts / total active sensors
- **Maintenance score**: ratio of overdue maintenance tasks to scheduled tasks
- **Compliance score**: mean compliance score from recent `ComplianceRecord` entries

### Derived Features
- Time since last HIGH/CRITICAL alert
- Days since last completed maintenance event
- Effluent parameter exceedance frequency (last 7 days)
- Treatment efficiency: (inlet_BOD - effluent_BOD) / inlet_BOD

---

## Training Strategy

### Phase 1 (Research — current)
- Use UCI WTP dataset as proxy
- Build and validate feature engineering pipeline
- Establish baseline scoring approaches
- Validate model architecture on proxy data

### Phase 2 (Pilot — when SILVAPURE hardware is deployed)
- Collect at least 90 days of continuous telemetry
- Label assessment records manually or via rule-based bootstrap labelling
- Train initial model on pilot plant data
- Validate against manual expert assessment

### Phase 3 (Production)
- Multi-plant training with per-plant fine-tuning
- Continuous retraining pipeline
- Human-in-the-loop correction of labels

---

## Validation Approach
- Hold-out the last 20% of the time series chronologically (no random shuffle)
- Walk-forward cross-validation on the remaining 80% (5 folds)
- Never allow future data to leak into training windows

---

## Evaluation Metrics
- For health status classification: Precision, Recall, F1 per class; Confusion matrix
- For numeric score regression: MAE, RMSE, R²
- Business metric: Rate of undetected CRITICAL status transitions within 24 hours
- See `training/evaluation-metrics.md` for targets and justifications

---

## Explainability

XGBoost/LightGBM models will use **SHAP values** (TreeSHAP) to explain individual plant health score predictions. The SILVAPURE dashboard will surface the top 3 contributing factors for any health score below 70.

LIME is a secondary explainability option for model-agnostic explanations.

**Explainability requirement from SILVAPURE schema:** The `PlantHealthAssessment.recommendation` field should be populated with a natural-language description derived from SHAP feature importances.

---

## Limitations

- During the proxy phase, there are no labelled plant health scores in any public dataset. All proxy targets are engineered and must be treated as imperfect approximations.
- Public datasets (UCI WTP) are from European/non-Indian facilities. Regulatory thresholds, process configurations, and climate conditions differ from SILVAPURE's target India market.
- The composite scoring approach is sensitive to the choice of component weights. These weights should be validated with domain experts.
- Model performance cannot be claimed until real SILVAPURE data is available.

---

## Data Requirements

See `data-requirements/SILVAPURE-telemetry-requirements.md` Section A for the complete telemetry specification required to train this model in production.

---

## Public Dataset Mapping

| Dataset | Role |
|---|---|
| UCI Water Treatment Plant | Proxy for effluent quality and process state features |
| data.gov.in CPCB | India-specific compliance context and parameter ranges |
| EPA Water Quality Portal | Parameter distribution reference |
