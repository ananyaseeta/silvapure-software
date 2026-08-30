# Kaggle Water Quality Dataset (mssmartypants)

## IMPORTANT CORRECTION NOTE
A previous version of this document incorrectly stated "approximately 3,276 records" and listed 9 features. Those numbers belong to a **different Kaggle dataset** (the Water Potability dataset documented in `uci-water-quality-prediction.md`).

This document covers the **`mssmartypants/water-quality` Kaggle dataset**, which has:
- **7,999 records**
- **20 physicochemical features**
- A binary safety target

These are verified values from the dataset's published description.

---

## Classification
**Type C — Synthetic/Simulated (provenance unverified) or Type B — Public real-world data of unclear origin**

---

## Official Name
Water Quality (as listed by uploader mssmartypants on Kaggle)

## Source
Kaggle — uploaded by user mssmartypants

## Verified URL
https://www.kaggle.com/datasets/mssmartypants/water-quality

**Access requirement:** Free Kaggle account required to download.

**Note on provenance:** The original data collection source is not clearly documented by the uploader. One published document associated with this dataset describes it as containing "7,999 samples of 20 different particulates, acting as the evidence for our model." No connection to a specific monitoring programme or regulatory database has been independently verified.

## Dataset Type
**UNCERTAIN — treat as provenance-unverified.**

The original measurement programme behind this dataset is not documented. Do not assume it represents any specific real-world water body or regulatory programme.

## Domain
Drinking water / general water quality — 20 physicochemical parameters for water safety binary classification. **This is not a wastewater dataset.**

## Number of Records
**7,999 records.** Verified from the dataset's published description and associated document.

## Features
**20 physicochemical parameters.** The exact feature names vary across descriptions, but based on the dataset's published paper document they include a broad set of water quality indicators covering:
- Standard physical parameters: pH, turbidity
- Dissolved gases and oxygen-related
- Chemical ions: aluminium, ammonia, arsenic, barium, cadmium, chloramine, chromium, copper, fluoride, bacteria, viruses, lead, nitrates, nitrites, mercury, perchlorate, radium, selenium, silver, uranium

**Verification note:** The exact 20 feature names should be confirmed by downloading the dataset and inspecting the column headers, as the uploader's documentation is sparse.

## Target Variable
Binary safety classification: whether water is safe (1) or unsafe (0) for human consumption.

**Critical limitation:** The labelling methodology is not documented. The thresholds and rules used to assign safe/unsafe labels are unknown, making this target unreliable for regulatory compliance validation.

## Time-Series Characteristics
None. Records are independent observations with no temporal ordering or timestamps.

## SILVAPURE Model Applicability

| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | No process data, no temporal structure |
| Water Quality Prediction | No (feature reference only) | Drinking water context; labels unreliable; no process data |
| Predictive Maintenance | No | No device or temporal data |
| Anomaly Detection | No (not recommended) | Static dataset only |

## Why It Is Sometimes Referenced
- Covers a broad set of physicochemical parameters, some of which overlap with SILVAPURE's sensor schema
- Used in educational ML classification benchmarks
- Larger than the 3,276-record potability dataset — more data for prototyping

## Limitations and What It Cannot Be Used For
- **Drinking water data.** Completely different regulatory context from wastewater.
- **Unverified labels.** Safe/unsafe classification methodology not documented.
- **Unclear provenance.** Cannot make wastewater or CPCB compliance claims.
- **No temporal structure.** Cannot be used for sequence modelling.
- **Not recommended for SILVAPURE model training.**

## Preprocessing Required (if used for prototyping only)
- Check and handle missing values
- Verify data types per column
- Standard normalisation

## Feature Engineering Possibilities
Limited. No temporal features. Basic feature interactions only.

## License
Kaggle-specific license set by uploader. **Verify the license tab on the Kaggle dataset page before any redistribution or commercial use.** Many Kaggle datasets list license as "Unknown."

## Redistribution Restrictions
**Do not redistribute.** License is unverified. Original data source is unknown.

## Recommended Use
**Not recommended for SILVAPURE model training.** Listed for awareness and to prevent confusion with the 3,276-record Water Potability dataset documented in `uci-water-quality-prediction.md`.

## Note on Duplication
The file `uci-water-quality-prediction.md` documents the **Water Potability dataset** (3,276 records, 9 features, different Kaggle URL). These are two distinct datasets. Do not merge them.

## Citation
No authoritative primary citation. If referenced: "Kaggle Water Quality dataset by mssmartypants, downloaded from https://www.kaggle.com/datasets/mssmartypants/water-quality."
