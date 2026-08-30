# artifacts/

This directory stores trained model artefacts, scalers, and serialised preprocessing objects.

**This directory is gitignored. No files in this directory are committed to version control.**

---

## Expected Contents (when models are trained)

```
artifacts/
├── plant_health/
│   ├── plant_health_v1_<date>_<dataset>/
│   │   ├── model.pkl          ← Trained model (XGBoost / LightGBM)
│   │   ├── scaler.pkl         ← Fitted StandardScaler
│   │   ├── feature_names.json ← List of features in training order
│   │   ├── config.json        ← Hyperparameters and training metadata
│   │   └── metrics.json       ← Evaluation metrics on validation/test set
│
├── water_quality/
│   ├── water_quality_v1_<date>_<dataset>/
│   │   ├── model.pt           ← PyTorch LSTM model weights
│   │   ├── scaler.pkl
│   │   ├── config.json
│   │   └── metrics.json
│
├── predictive_maintenance/
│   ├── failure_classifier_v1_<date>_<dataset>/
│   │   ├── model.pkl
│   │   ├── scaler.pkl
│   │   ├── config.json
│   │   └── metrics.json
│   └── rul_regressor_v1_<date>_<dataset>/
│       ├── model.pt
│       ├── scaler.pkl
│       ├── config.json
│       └── metrics.json
│
└── anomaly_detection/
    └── isolation_forest_v1_<date>_<dataset>/
        ├── model.pkl
        ├── scaler.pkl
        ├── threshold.json     ← Selected anomaly threshold
        ├── config.json
        └── metrics.json
```

---

## Naming Convention

`{model_name}_{version}_{YYYYMMDD}_{dataset_source}`

Examples:
- `water_quality_v1_20250101_uci_wtp`
- `failure_classifier_v1_20250601_silvapure_pilot`

---

## Important

- Never commit model artefacts trained on SILVAPURE real customer data to any public repository
- Track model versions using MLflow or equivalent experiment tracking
- Document the dataset, preprocessing config, and metrics for every artefact
