# Anomaly Detection Model

## Problem Definition

The Anomaly Detection model identifies unusual patterns in SILVAPURE's multivariate sensor telemetry streams that may indicate:
- Sensor malfunction or calibration drift
- Process upsets (sudden chemical loading, equipment failure, blockage)
- Cyber-physical manipulation of sensor readings
- Data quality issues requiring operator review

This is primarily an **unsupervised anomaly detection problem** because labelled anomaly data from SILVAPURE's own systems will not exist at deployment time. A semi-supervised approach is used where a "normal" operating baseline is established from historical data.

---

## Anomaly Taxonomy for SILVAPURE

| Anomaly Type | Description | Example |
|---|---|---|
| Point anomaly | Single measurement grossly outside expected range | pH reading of 13.5 at a stable plant |
| Contextual anomaly | Value normal in isolation but anomalous given context | BOD drops to 10 mg/L during heavy storm inflow |
| Collective anomaly | Group of consecutive readings forming an unusual pattern | All sensors flatline simultaneously (frozen sensor or communication failure) |
| Trend anomaly | Gradual drift that individually appears normal | Slow upward temperature trend over 72h |
| Seasonal anomaly | Deviation from expected seasonal pattern | No monsoon-related dilution effect when expected |

---

## Inputs

### From SILVAPURE Telemetry (production phase)
- All continuous sensor readings (pH, DO, BOD, COD, TSS, turbidity, flow, temperature, conductivity)
- Sensor communication status flags
- Device heartbeat intervals
- Alert acknowledgement patterns (anomalously high unacknowledged alerts)
- Process setpoint vs actual deviation

### From Proxy Datasets (research phase)
- SWaT dataset (restricted access): primary methodology reference for water treatment anomaly detection
- NAB dataset: algorithm evaluation framework with temporal tolerance scoring
- UCI Water Treatment Plant: real wastewater data for unsupervised anomaly detection development

---

## Candidate Algorithms

| Algorithm | Type | Best For |
|---|---|---|
| Isolation Forest | Unsupervised | Point and collective anomalies in tabular data; handles high dimensionality |
| Local Outlier Factor (LOF) | Unsupervised | Density-based outlier detection |
| DBSCAN | Unsupervised | Clustering-based anomaly identification |
| Autoencoder (reconstruction error) | Semi-supervised | Multivariate time-series anomalies; train on normal data only |
| LSTM Autoencoder | Semi-supervised | Sequential anomalies in time-series |
| One-Class SVM | Semi-supervised | Binary (normal/anomalous) boundary learning |
| Statistical Process Control (CUSUM, EWMA) | Rule-based baseline | Parameter-specific control charts; explainable; regulatory familiarity |

**Recommended starting approach:** Isolation Forest for rapid deployment baseline, with LSTM Autoencoder as the sequence-aware upgrade.

---

## Preprocessing

1. **Train ONLY on normal-operation data**: Collect a baseline period with no known faults or alerts (minimum 30 days recommended)
2. Normalise using statistics from the normal-operation training set — apply the same scaler to all future data (never refit on potentially anomalous data)
3. Handle missing values during inference: impute with training-period mean, and flag the imputation as a feature
4. For sequence models: construct fixed-length sliding windows (e.g., 60-second or 5-minute windows)
5. Remove known maintenance shutdown periods from the training normal-operation baseline

---

## Feature Engineering

### Multivariate Statistical Features (computed over rolling windows)
- Mahalanobis distance from the training-period centroid (captures multivariate correlation structure)
- Rolling z-score per sensor (flagging unusual deviations per channel)
- Inter-sensor correlation residuals (e.g., if pH and DO are normally correlated, detect when they decouple)

### Physics-Based Constraint Features
- Mass balance violations: inlet flow × inlet_concentration ≠ outlet flow × outlet_concentration + process load
- Temperature thermodynamic constraint violations
- DO depletion rate vs aeration rate consistency

### Temporal Features
- Time of day (many normal operational patterns are diurnal)
- Day of week
- Monsoon season indicator

---

## Training Strategy

### Phase 1 (Research — current)
- Implement Isolation Forest and LSTM Autoencoder on UCI WTP data (unsupervised, no labels)
- Calibrate NAB scoring methodology on NAB dataset
- Study SWaT-based publications for water treatment anomaly detection approaches (access-restricted; read published papers)
- Establish evaluation framework before SILVAPURE data is available

### Phase 2 (Pilot — first 30–90 days of deployment)
- Collect baseline "normal operation" data from pilot plant
- Train Isolation Forest on baseline — deploy as soft alert generator
- Operators label alerts as True/False anomalies (human-in-the-loop)
- Use operator labels to build a semi-supervised training set over time

### Phase 3 (Production)
- Retrain with accumulated labelled anomaly examples
- Per-plant fine-tuning (different plants have different normal operating envelopes)
- Concept drift monitoring: retrain baseline when sustained process changes occur (e.g., seasonal)

---

## Validation

- Evaluate on holdout anomaly examples (operator-labelled in pilot phase)
- NAB-score-based evaluation where temporal tolerance is required
- Manual review of top-scoring anomaly alerts by plant engineers

---

## Evaluation Metrics

- Precision and Recall on labelled anomaly windows
- F1 at the operating threshold
- NAB Score (if using NAB benchmark framework)
- False Positive Rate — high FPR leads to alert fatigue and ignored anomalies
- Mean Time to Detect (MTTD): how early is the anomaly flagged before visible process impact

See `training/evaluation-metrics.md` for full definitions.

---

## Alert Integration with SILVAPURE

The anomaly detection model feeds the `Alert` model in the SILVAPURE schema:
- `Alert.source = AlertSource.SYSTEM` for model-generated alerts
- `Alert.severity` mapped from anomaly score percentile
- `Alert.title` and `Alert.description` populated from SHAP feature contributions or top contributing sensors

---

## Explainability

Unsupervised anomaly detection is inherently harder to explain than supervised models. Approaches:
- For Isolation Forest: SHAP TreeSHAP produces feature-level anomaly attribution
- For Autoencoder: per-feature reconstruction error identifies which sensors are anomalous
- LIME can provide local approximation explanations for any black-box anomaly score

**Minimum explainability requirement:** Any alert generated by the anomaly model must include the top 2 sensor/feature contributors to the anomaly score.

---

## Limitations

- No labelled SILVAPURE anomaly data exists at the start of deployment. Initial false positive rate will be higher than post-learning period.
- SWaT is the best available proxy dataset but is from a clean water treatment context (not wastewater) and covers cyber-physical attacks rather than operational process anomalies.
- NAB covers infrastructure metrics, not water treatment — algorithm rankings on NAB may not generalise to SILVAPURE.
- Statistical anomaly detection is sensitive to the choice of "normal" baseline period. If the baseline itself contains anomalies, sensitivity will be degraded.

---

## Data Requirements

See `data-requirements/SILVAPURE-telemetry-requirements.md` Section D.

---

## Public Dataset Mapping

| Dataset | Role |
|---|---|
| SWaT (restricted) | Primary methodology reference for water treatment anomaly detection |
| NAB | Anomaly detection algorithm evaluation framework and scoring methodology |
| UCI Water Treatment Plant | Real wastewater data for unsupervised anomaly baseline development |
