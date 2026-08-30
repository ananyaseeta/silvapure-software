# Kaggle Water Potability Dataset

## IMPORTANT CORRECTION NOTE
A previous version of this document incorrectly attributed this dataset to "UCI Machine Learning Repository, dataset ID 374". That attribution has been removed because:
- UCI dataset ID 374 does not resolve (HTTP timeout/unavailable)
- The 3,276-record, 10-feature water potability dataset described here originates from Kaggle, not from a verified UCI source
- Multiple independent published papers and repositories confirm the 3,276-record version as a Kaggle-origin dataset

**This file now correctly documents the Kaggle Water Potability dataset.** See also `kaggle-water-quality.md` for the separate `mssmartypants/water-quality` Kaggle dataset (7,999 records, 20 features), which is a **different dataset**.

---

## Classification
**Type C — Synthetic/Simulated (provenance unverified) or Type B — Public real-world data of unclear origin**

---

## Official Name
Water Potability (as listed on multiple Kaggle uploads)

## Source
Kaggle (multiple uploaders). The most widely circulated version is at:
https://www.kaggle.com/datasets/adityakadiwal/water-potability

## Verified URL
https://www.kaggle.com/datasets/adityakadiwal/water-potability

**Access requirement:** Free Kaggle account required to download.

**Note on provenance:** The original data source behind this dataset is **not clearly documented** by the Kaggle uploader. It has been cited widely in ML publications as a benchmark, but its connection to any real-world monitoring programme has not been independently verified. Multiple versions exist on Kaggle with the same 3,276-record structure but uploaded by different users.

## Dataset Type
**UNCERTAIN — treat as provenance-unverified.**

This dataset circulates widely but its original data collection methodology, sampling programme, and labelling process are not documented. It may be real, synthetic, or a combination. **Do not treat the potability binary labels as representing verified regulatory assessments.**

## Domain
Drinking water — physicochemical properties.

**This is drinking water data, not wastewater data.** The parameters measured (pH, hardness, chloramines, etc.) relate to drinking water safety, not wastewater treatment effluent quality.

## Number of Records
3,276 records. Verified consistent across multiple independent published sources citing this dataset.

## Features
9 physicochemical measurement features:
1. pH (0–14 scale)
2. Hardness (mg/L as CaCO₃)
3. Solids (Total Dissolved Solids, ppm)
4. Chloramines (ppm)
5. Sulfate (mg/L)
6. Conductivity (µS/cm)
7. Organic_carbon (ppm)
8. Trihalomethanes (µg/L)
9. Turbidity (NTU)

## Target Variable
Potability (binary: 1 = potable / safe to drink, 0 = not potable)

**Critical limitation on the target:** The labelling methodology — how the binary potability judgment was derived — is not documented in the Kaggle description. The threshold rules used to assign labels are unknown. This makes the target unreliable for any regulatory compliance modelling.

## Time-Series Characteristics
None. Records are independent observations with no temporal ordering, no station identifiers, and no timestamps. This is a static tabular dataset.

## SILVAPURE Model Applicability

| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | No process-level data, no temporal structure |
| Water Quality Prediction | No (feature reference only) | Parameters overlap with SILVAPURE sensors but data is not process-level and labels are unreliable |
| Predictive Maintenance | No | No device or temporal data |
| Anomaly Detection | No (not recommended) | Static dataset; no temporal anomaly patterns |

## Why It Is Sometimes Referenced
- Widely used in ML education and benchmarking — many published tutorials exist
- Parameter overlap with SILVAPURE sensor schema (pH, turbidity, conductivity)
- Useful for rapid pipeline prototyping on a simple binary classification task

## Limitations and What It Cannot Be Used For
- **Drinking water context.** Standards and parameters differ from wastewater effluent.
- **No timestamps.** Cannot be used for any time-series or sequence modelling.
- **Unverified labels.** Potability binary labels have no documented derivation.
- **Unclear provenance.** Cannot make regulatory compliance claims based on this dataset.
- **Not applicable for SILVAPURE model training.** Listed for reference/awareness only.
- **Not a wastewater dataset.** Do not describe it as one.

## Preprocessing Required (if used for prototyping only)
- Handle missing values: approximately 15–20% across features
- Standard normalisation (StandardScaler or MinMaxScaler)
- No temporal features needed (no time dimension)

## Feature Engineering Possibilities
Limited. No temporal or process-level features possible. Basic feature interactions only.

## License
Kaggle dataset licenses are set per uploader. The linked upload shows license as **unknown** or unspecified in several versions. **Do not redistribute without checking the specific upload's license tab.**

## Redistribution Restrictions
**Do not redistribute.** License is unverified. Original data source is unknown.

## Recommended Use
**Not recommended for SILVAPURE model training or validation.** May be used for:
- Understanding which physicochemical features overlap with SILVAPURE's sensor schema
- Basic ML pipeline prototyping (classification mechanics only)
- Educational benchmarking

## Note on Duplication with kaggle-water-quality.md
The file `kaggle-water-quality.md` documents a **different dataset**: `mssmartypants/water-quality` which has 7,999 records and 20 features. These are two distinct Kaggle datasets with similar names. Do not merge them.

## Citation
No authoritative primary citation exists for this dataset. If referenced in publications, note it as "Kaggle Water Potability dataset (provenance unverified), downloaded from https://www.kaggle.com/datasets/adityakadiwal/water-potability".
