# UCI AI4I 2020 Predictive Maintenance Dataset

## Classification
**Type C — Synthetic data (explicitly stated by dataset creators)**

---

## Official Name
AI4I 2020 Predictive Maintenance Dataset

## Official Source
UCI Machine Learning Repository

## URL
https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset

## Dataset Type
Synthetic (explicitly stated by the dataset creators — generated to reflect real predictive maintenance scenarios)

## Domain
Industrial machine/equipment predictive maintenance — generic manufacturing context

## Number of Records
10,000 data points

## Features
**14 columns total:**
- UID: unique identifier (1 to 10,000)
- productID: product quality variant (L/M/H — low/medium/high quality; categorical)
- Type: same as productID (L/M/H)
- air temperature [K]
- process temperature [K]
- rotational speed [rpm]
- torque [Nm]
- tool wear [min]

**Note on feature count:** The dataset has 14 total columns. Of these, 5 columns are continuous sensor/measurement features (air temperature, process temperature, rotational speed, torque, tool wear). The remaining columns are identifiers, a categorical quality code, the primary binary failure target, and 5 individual binary failure mode labels.

Target columns (not model inputs):
- machine failure (primary binary target)
- TWF (Tool Wear Failure — binary)
- HDF (Heat Dissipation Failure — binary)
- PWF (Power Failure — binary)
- OSF (Overstrain Failure — binary)
- RNF (Random Failures — binary)

## Target Variable
Primary: `machine failure` (binary: 0 = normal, 1 = failure)
Secondary targets available: individual failure mode labels (TWF, HDF, PWF, OSF, RNF)

## Time-Series Characteristics
Records are ordered sequentially but the dataset does not include explicit timestamps. It is ordered to simulate temporal progression of tool wear. It is NOT a true time series with timestamps, but sequential ordering encodes wear progression.

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | Manufacturing context, not wastewater treatment |
| Water Quality Prediction | No | No water quality features |
| Predictive Maintenance | Yes (proxy) | Primary proxy dataset for failure prediction development |
| Anomaly Detection | Partial (proxy) | Failure onset can be modelled as anomaly |

## Why It Is Useful
- Clean, well-documented synthetic dataset specifically designed for ML benchmarking
- Multiple failure modes available (multi-label classification possible)
- Widely used in the predictive maintenance ML community — easy to benchmark against published results
- Manageable size for rapid prototyping
- Feature set (temperature, speed, torque, wear) has conceptual parallels to wastewater pump and aeration equipment

## What It Cannot Be Used For
- Wastewater-specific equipment modelling (air blowers, submersible pumps, filter presses, UV disinfection units)
- True time-series sequence modelling (no real timestamps)
- Remaining Useful Life (RUL) estimation in the traditional sense (no degradation trajectory)
- Production SILVAPURE maintenance models without domain adaptation

## Important Distinction
This dataset is **synthetic**. It was generated with predefined rules to simulate failure conditions. Real SILVAPURE equipment failure patterns will differ. All insights from this dataset must be treated as methodological proxies only.

## Preprocessing Required
- Encode categorical `productID` feature (L/M/H)
- Normalise continuous features to zero mean, unit variance or [0,1] range
- Address class imbalance: ~3.4% failure rate — use oversampling (SMOTE), class weighting, or threshold tuning
- For multi-label classification: verify mutual exclusivity of failure modes (RNF can co-occur with others)

## Feature Engineering Possibilities
- Power calculation: power = 2π × rotational_speed × torque / 60 (already derivable from existing features)
- Temperature differential: process_temp - air_temp
- Torque-speed product as a proxy for mechanical stress
- Cumulative wear indicators using rolling sums

## License
Creative Commons Attribution 4.0 International (CC BY 4.0)
https://creativecommons.org/licenses/by/4.0/

This license permits redistribution, adaptation, and commercial use with attribution.

## Redistribution Restrictions
Freely redistributable under CC BY 4.0 with attribution. The dataset may be included in model development pipelines and shared in research contexts.

## Recommended Use
- Primary development dataset for SILVAPURE Predictive Maintenance model
- Failure classification algorithm benchmarking (XGBoost, Random Forest, LightGBM)
- Imbalanced classification technique evaluation
- Multi-label classification development

## Citation
Stephan Matzka. (2020). AI4I 2020 Predictive Maintenance Dataset. UCI Machine Learning Repository. https://doi.org/10.24432/C5HS5C

Matzka, S. (2020). Explainable Artificial Intelligence for Predictive Maintenance Applications. In 2020 Third International Conference on Artificial Intelligence for Industries (AI4I) (pp. 69–74). IEEE.
