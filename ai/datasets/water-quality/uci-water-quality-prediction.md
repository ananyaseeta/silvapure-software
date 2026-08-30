# UCI Water Quality Dataset

## Official Name
Water Quality (also referenced as "Water Potability" in some distributions)

## Official Source
UCI Machine Learning Repository

## URL
https://archive.ics.uci.edu/dataset/374/water+quality

> Note: There are multiple "water quality" datasets on UCI and Kaggle. This document refers to the UCI dataset at the URL above. A widely circulated "water_potability.csv" on Kaggle (3276 rows, 10 features) has unclear provenance — see the Kaggle dataset document for that variant.

## Dataset Type
Uncertain — the exact provenance of the UCI water quality dataset at this URL should be verified. Some versions list simulated or synthetically augmented data. **Do not assume real-world operational data without source verification.**

## Domain
Drinking water quality assessment — physicochemical parameters

## Number of Records
UNVERIFIED for the specific UCI entry at the URL above. The commonly cited Kaggle variant has 3,276 records. Verify at source before using a specific row count in any publication.

## Features
Commonly included features across distributions of this dataset:
- pH (hydrogen ion concentration)
- Hardness (mg/L as CaCO3)
- Solids (Total Dissolved Solids, mg/L)
- Chloramines (ppm)
- Sulfate (mg/L)
- Conductivity (µS/cm)
- Organic Carbon (mg/L)
- Trihalomethanes (µg/L)
- Turbidity (NTU)

## Target Variable
Potability (binary: 1 = safe to drink, 0 = not safe) in the drinking water variants.

**Important limitation:** The binary potability label oversimplifies real water quality assessment, which requires multi-parameter compliance evaluation. This target is not directly applicable to wastewater treatment effluent quality.

## Time-Series Characteristics
No time dimension. Records are independent observations. This dataset is NOT a time series and cannot be used directly for temporal modelling without significant augmentation.

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | Partial | Feature overlap only; not a process time series |
| Water Quality Prediction | Partial (feature reference) | Useful for identifying relevant physicochemical features |
| Predictive Maintenance | No | No temporal or device data |
| Anomaly Detection | Partial | Outlier detection on static physicochemical readings |

## Why It Is Useful
- Provides a reference set of physicochemical water quality parameters
- Useful for validating feature selection decisions
- Cross-tabulation with SILVAPURE parameter constants (pH, conductivity, turbidity already in SILVAPURE schema)

## What It Cannot Be Used For
- Time-series prediction (no timestamps)
- Wastewater effluent prediction (this is drinking water data)
- Regulatory compliance modelling for Indian discharge standards
- Direct training of sequence models
- Any use that treats potability labels as equivalent to wastewater discharge compliance

## Preprocessing Required
- Handle missing values (approximately 15–20% in some features depending on distribution)
- Scale features to common range
- Verify units match SILVAPURE sensor output units

## Feature Engineering Possibilities
- Ratio of TOC to turbidity
- Conductivity-hardness product
- pH deviation from neutral

## License
UCI ML Repository terms. Verify at source. The Kaggle "water_potability.csv" has unclear original source — treat as provenance-unverified.

## Redistribution Restrictions
Verify before redistribution. The Kaggle-circulated version has unclear original provenance; redistribution of that specific file is not recommended without trace to primary source.

## Recommended Use
- Reference for physicochemical feature selection in water quality models
- Benchmark for static water quality classifiers (not SILVAPURE's primary use case)
- Educational demonstrations of water quality ML concepts

## Citation
UCI Machine Learning Repository. Verify specific citation at https://archive.ics.uci.edu/dataset/374/water+quality
