# SILVAPURE AI/ML Research Repository

This repository contains dataset documentation, model specifications, preprocessing plans, training strategies, and research references for the four AI/ML models planned for the SILVAPURE enterprise wastewater management platform.

---

## Purpose

SILVAPURE's ML pipeline is currently in the **research and preparation phase**. No models have been trained yet. This repository serves as:

- A vetted catalogue of candidate public datasets
- Model architecture specifications
- Data preprocessing and feature engineering plans
- Training and evaluation strategies
- A bridge toward SILVAPURE's own real-world telemetry when hardware is deployed

---

## Repository Layout

```
ai/
├── README.md                          ← This file
├── DATASET-MATRIX.md                  ← Cross-dataset comparison table
│
├── datasets/
│   ├── water-quality/                 ← Candidate datasets for water quality and plant health
│   │   ├── uci-water-treatment-plant.md
│   │   ├── uci-water-quality-prediction.md
│   │   ├── epa-water-quality-portal.md
│   │   ├── data-gov-in-water-quality.md
│   │   └── kaggle-water-quality.md
│   ├── predictive-maintenance/        ← Candidate datasets for predictive maintenance
│   │   ├── uci-ai4i-2020.md
│   │   ├── nasa-cmapss.md
│   │   └── phm-data-challenge.md
│   └── anomaly-detection/             ← Candidate datasets for anomaly detection
│       ├── swat.md
│       ├── nab.md
│       └── uci-wastewater-anomaly.md
│
├── models/
│   ├── plant-health.md                ← Plant Health Scoring model spec
│   ├── water-quality.md               ← Water Quality Prediction model spec
│   ├── predictive-maintenance.md      ← Predictive Maintenance model spec
│   └── anomaly-detection.md           ← Anomaly Detection model spec
│
├── preprocessing/
│   └── preprocessing-plan.md          ← Shared preprocessing methodology
│
├── training/
│   ├── training-strategy.md           ← Training phases and transfer strategy
│   ├── evaluation-metrics.md          ← Per-model metrics with justifications
│   └── data-splitting.md              ← Splitting strategy for time-series data
│
├── data-requirements/
│   └── SILVAPURE-telemetry-requirements.md  ← Sensor/telemetry spec for real deployment
│
├── references/
│   ├── ml-references.md               ← Algorithm and framework references
│   ├── xai-references.md              ← Explainability references (SHAP, LIME)
│   ├── research-papers.md             ← Key research papers
│   └── regulations.md                 ← Environmental/regulatory standards
│
├── src/
│   ├── plant_health/                  ← Model code (future)
│   ├── water_quality/                 ← Model code (future)
│   ├── predictive_maintenance/        ← Model code (future)
│   └── anomaly_detection/             ← Model code (future)
│
├── notebooks/                         ← Exploratory and validation notebooks (future)
└── artifacts/                         ← Trained model artifacts (future, gitignored)
```

---

## The Four SILVAPURE Models

| Model | Problem Type | Primary Data Source | Status |
|---|---|---|---|
| Plant Health Scoring | Regression / Classification | SILVAPURE telemetry + proxy datasets | Research |
| Water Quality Prediction | Regression | UCI WTP, EPA Portal | Research |
| Predictive Maintenance | Classification / Regression (RUL) | UCI AI4I, NASA CMAPSS | Research |
| Anomaly Detection | Unsupervised / Semi-supervised | SWaT (restricted), NAB | Research |

---

## Data Policy

### What is committed to this repository
- Documentation files (Markdown) describing datasets
- Access instructions for restricted datasets
- Preprocessing code and notebooks (no raw data)

### What is NOT committed
- Raw dataset files from sources that prohibit redistribution
- Trained model weights (stored in `artifacts/`, gitignored)
- Any data containing personally identifiable information

### Restricted datasets
The following datasets require a formal access request and must NOT be committed:
- **SWaT** (iTrust, SUTD) — requires signed data usage agreement
- **NASA CMAPSS** — verify current NASA Open Data license before redistribution

See each dataset's `.md` file for exact access instructions.

---

## How to Use This Repository

### 1. Choose a model to work on
Start with the relevant file in `models/` to understand the problem definition, required features, and candidate algorithms.

### 2. Identify candidate datasets
Read the files in `datasets/<domain>/` for each candidate dataset. Check the license field before downloading anything.

### 3. Download datasets locally
Follow the access instructions in each dataset doc. Store downloaded data in a local `data/` directory that is gitignored.

### 4. Follow the preprocessing plan
See `preprocessing/preprocessing-plan.md` for the shared pipeline approach.

### 5. Follow the training strategy
See `training/training-strategy.md` for the phased approach from public data to SILVAPURE real data.

### 6. Review evaluation metrics
See `training/evaluation-metrics.md` for per-model metrics and thresholds.

---

## SILVAPURE Telemetry Transition

All four models will eventually be retrained or fine-tuned on real SILVAPURE hardware telemetry. The `data-requirements/SILVAPURE-telemetry-requirements.md` file specifies the exact sensor readings, sampling rates, and data schema that SILVAPURE hardware must provide for each model.

Public datasets are used only as proxies during the research and early development phase.

---

## Important Caveats

- No model accuracy numbers are presented in this repository. None of the models have been trained yet.
- Dataset applicability assessments are based on domain similarity and feature overlap. They are research judgements, not guarantees.
- Water quality standards referenced are based on publicly available regulatory guidelines (CPCB India, EPA USA). Always verify current applicable standards with a qualified environmental engineer.
- This repository does not constitute a data management plan for production deployment. A separate DMP should be created before processing real wastewater facility data.
