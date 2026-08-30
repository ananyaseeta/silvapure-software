# UCI Water Treatment Plant Dataset

## Official Name
Water Treatment Plant (water-treatment.data)

## Official Source
UCI Machine Learning Repository — Center for Machine Learning and Intelligent Systems, University of California Irvine

## URL
https://archive.ics.uci.edu/dataset/207/water+treatment+plant

## Dataset Type
Real (collected from an operational urban wastewater treatment plant)

## Domain
Municipal wastewater treatment — biological treatment plant (activated sludge process)

## Number of Records
527 daily observations (spanning approximately 2 years of daily plant readings)

## Features
38 sensor/process measurements including:
- Input stage: SS (suspended solids), SED, COND, PH, DBO, DQO, SS_S, SED_S, COND_S
- Primary settler: SS_P, SED_P
- Aeration tank: SS_A, SED_A, COND_A, PH_A, DBO_A, DQO_A, SS_S_A
- Secondary settler: SS_D, SED_D, COND_D, PH_D, DBO_D, COD_D
- Effluent: SS_E, SED_E, COND_E, PH_E, DBO_E, DQO_E
- Recycling/return flows: several derived flow indicators

Note: Several features contain missing values (indicated by "?"). The dataset does not include timestamps in the standard distribution; daily ordering is implied.

## Target Variable
No single designated target. The dataset is used for:
- Predicting effluent quality (DBO_E, DQO_E, SS_E) given inlet conditions
- Fault/anomaly detection (non-normal operational states)
- Process state classification

## Time-Series Characteristics
- Daily resolution
- Sequential daily records — order matters
- Short autocorrelation window (plant biological processes operate on 1–7 day cycles)
- Missing values are not random; they often reflect sensor failure or maintenance periods

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | Yes (proxy) | Multi-stage process health indicators |
| Water Quality Prediction | Yes (primary proxy) | Effluent parameter prediction |
| Predictive Maintenance | Partial (proxy) | Missing value patterns can simulate sensor degradation |
| Anomaly Detection | Yes (proxy) | Operational state anomalies |

## Why It Is Useful
- One of very few publicly available real operational wastewater treatment datasets
- Multi-stage process measurements (input → treatment → effluent) mirror SILVAPURE's treatment plant hierarchy
- Long enough time series for sequence-based modelling approaches
- Missing values provide realistic data quality scenarios

## What It Cannot Be Used For
- Industrial or pharmaceutical wastewater (this is municipal STP data only)
- Sub-daily or real-time modelling (daily resolution only)
- Device-level predictive maintenance (no device-specific sensor health readings)
- Direct regulatory threshold validation (units and thresholds are European, not necessarily Indian CPCB standards)
- Cannot be treated as representative of all wastewater types

## Preprocessing Required
- Handle missing values: imputation (forward-fill, median, or KNN) depending on mechanism
- Normalise/standardise all continuous features (different physical units)
- Reconstruct temporal order before any sequence modelling
- Verify unit consistency across features
- Remove or flag observations with more than a threshold percentage of missing features

## Feature Engineering Possibilities
- Rolling mean/std over 3, 7, 14-day windows for trend capture
- Ratio features: DQO/DBO ratio (biodegradability indicator), SS removal efficiency
- Lag features (t-1, t-3, t-7) for autoregressive models
- Difference features (day-over-day change rates)
- Process efficiency scores per treatment stage

## License
UCI ML Repository standard terms — free for research and educational use. No explicit redistribution prohibition for the data files, but always verify at source before redistribution.

> As of the date of this document, UCI ML Repository datasets are generally available under a Creative Commons Attribution 4.0 International license or similar open terms. Verify at https://archive.ics.uci.edu/dataset/207/water+treatment+plant before redistribution.

## Redistribution Restrictions
No known hard restriction on redistribution for research. Do not redistribute without attribution. Do not use for commercial purposes without verifying the UCI terms for this specific dataset.

## Recommended Use
- Baseline development for Water Quality Prediction model
- Feature engineering experimentation
- Missing data handling strategy validation
- Proxy for Plant Health multi-stage scoring

## Citation
Bejar, J., Cortes, U., Poch, M. (1993). LINNEO+: A Classification Methodology for Ill-Structured Domains. Research Report, Llenguatges i Sistemes Informatics, Universitat Politecnica de Catalunya.

UCI Repository citation:
Dua, D. and Graff, C. (2019). UCI Machine Learning Repository. Irvine, CA: University of California, School of Information and Computer Science.
