# Training Strategy

## Overview

SILVAPURE's ML development follows a three-phase training strategy to bridge the gap between publicly available proxy datasets (current state) and SILVAPURE's own real-world telemetry (future state).

---

## Phase 1 — Research and Pipeline Validation (current)

**Goal:** Validate algorithm choices, preprocessing pipelines, and evaluation frameworks using publicly available proxy datasets. Produce no performance claims applicable to SILVAPURE production.

### What Phase 1 Produces
- Vetted preprocessing pipelines per model
- Algorithm comparison benchmarks on proxy datasets (relative comparison only, not production claims)
- Feature engineering patterns applicable to SILVAPURE telemetry
- Working code scaffolding in `src/<model>/`
- Jupyter notebooks with documented experiment results in `notebooks/`

### What Phase 1 Does NOT Produce
- Any model performance number applicable to SILVAPURE production deployments
- Models deployed to any SILVAPURE environment
- Claims about SILVAPURE model accuracy

### Datasets Used in Phase 1
| Model | Primary Proxy Dataset |
|---|---|
| Plant Health Scoring | UCI Water Treatment Plant |
| Water Quality Prediction | UCI Water Treatment Plant |
| Predictive Maintenance | UCI AI4I 2020 (classification), NASA CMAPSS (RUL) |
| Anomaly Detection | UCI Water Treatment Plant (unsupervised), NAB (evaluation framework) |

### Algorithm Selection Process (Phase 1)
For each model, run the following comparison:
1. Statistical baseline (ARIMA/SARIMA/SPC) — establishes the floor
2. Tree-based model (XGBoost or LightGBM with lag features) — fast, strong baseline
3. Sequence model (LSTM or TFT) — evaluate if temporal architecture adds value over lagged tabular approach

Select the architecture that offers the best trade-off between performance, interpretability, and training complexity for production deployment.

---

## Phase 2 — Pilot Training on Real SILVAPURE Data

**Trigger:** At least one SILVAPURE treatment plant has been continuously monitored for a minimum of:
- 90 days for Water Quality Prediction and Anomaly Detection
- 180 days for Plant Health Scoring
- 365 days (preferred) for Predictive Maintenance

**Goal:** Train initial production models on real SILVAPURE telemetry. Validate performance against operator ground truth.

### Phase 2 Steps
1. **Export telemetry** from SILVAPURE PostgreSQL database via `Telemetry`, `Sensor`, `Alert`, and `Maintenance` tables
2. **Apply preprocessing pipeline** developed in Phase 1
3. **Retrain** chosen architecture on real data
4. **Human-in-the-loop validation**: plant operators review model predictions for 30 days alongside actual operations
5. **Adjust thresholds and confidence levels** based on operator feedback
6. **Document performance** on held-out real data

### Phase 2 Constraints
- Training and validation data must remain within the SILVAPURE infrastructure
- No training data is committed to this repository
- Model artefacts (weights, scaler objects) stored in `artifacts/` which is gitignored

---

## Phase 3 — Production and Fleet Learning

**Goal:** Multi-plant models with per-plant fine-tuning; continuous retraining pipeline.

### Retraining Triggers
| Trigger | Action |
|---|---|
| Concept drift detected (distribution shift in incoming data) | Retrain on recent N-day rolling window |
| New plant onboarded | Fine-tune base model on new plant data |
| Scheduled periodic retraining | Monthly rolling retrain |
| Model performance drops below threshold | Full retrain + algorithm re-evaluation |

### Fleet Learning Approach
- Train a base model on pooled data from all plants
- Fine-tune per plant using the last 30 days of plant-specific data
- Use the base model as a warm start for new plants with insufficient history

---

## Transfer Learning Approach

For the transition from proxy data (Phase 1) to SILVAPURE data (Phase 2):

### Tree Models (XGBoost, LightGBM)
- No weight transfer — tree models train from scratch on the new dataset
- Feature engineering patterns from Phase 1 are reused

### Neural Network Models (LSTM, TFT, Autoencoder)
- Pre-train on proxy dataset (UCI WTP, NASA CMAPSS)
- Fine-tune on SILVAPURE data by unfreezing all layers and training with a lower learning rate
- This is beneficial when SILVAPURE data is limited (< 90 days)

---

## Hyperparameter Tuning

Use Bayesian optimisation (Optuna) for hyperparameter search. Do not perform exhaustive grid search.

Key hyperparameters to tune per model type:

### XGBoost / LightGBM
- `max_depth` / `num_leaves`
- `learning_rate`
- `n_estimators`
- `subsample`, `colsample_bytree`
- `scale_pos_weight` (for imbalanced classification)

### LSTM
- `hidden_size`, `num_layers`
- `sequence_length` (window size)
- `dropout`
- `learning_rate`, `batch_size`

### Isolation Forest
- `n_estimators`
- `contamination` (expected anomaly fraction)
- `max_features`

**Tuning rule:** All hyperparameter tuning is performed on the validation set only. The test set is not seen until final model evaluation.

---

## Experiment Tracking

All training runs should be logged using MLflow or equivalent (to be decided by the ML team). Log:
- Dataset version and source
- Preprocessing configuration
- Hyperparameters
- Train/val/test metrics
- Model artefact path
- Training duration and hardware

---

## Model Versioning

Model versions follow the format: `{model_name}_v{version}_{date}_{dataset_source}`

Example: `water_quality_v1_20250101_uci_wtp`

Production models are tagged separately: `water_quality_prod_v1`
