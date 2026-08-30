# Kaggle Water Quality Datasets

## Overview and Important Provenance Warning

Kaggle hosts several water quality datasets of varying provenance. **The datasets listed here have uncertain or unclear original sources.** Before using any Kaggle-hosted water quality dataset for production model development, trace the data back to its primary source.

This document covers the most commonly referenced Kaggle water quality dataset.

---

## Dataset: Water Quality and Potability

### Official Name (as listed on Kaggle)
Water Quality

### Source on Kaggle
https://www.kaggle.com/datasets/mssmartypants/water-quality

### Dataset Type
**UNCERTAIN** — The dataset description on Kaggle does not clearly identify a primary authoritative source. Some versions appear to be synthetically generated or heavily augmented. **Treat as synthetic/unverified unless primary source is confirmed.**

### Domain
Drinking water potability assessment — physicochemical parameters

### Number of Records
Approximately 3,276 records (this is the commonly circulated version; exact count may vary by upload)

### Features
- pH (0–14 scale)
- Hardness (mg/L)
- Solids (Total Dissolved Solids, ppm)
- Chloramines (ppm)
- Sulfate (mg/L)
- Conductivity (µS/cm)
- Organic Carbon (ppm)
- Trihalomethanes (µg/L)
- Turbidity (NTU)

### Target Variable
Potability (binary: 1 = potable, 0 = not potable)

**Critical limitation:** The binary potability classification is not grounded in a specific verified labelling methodology. The thresholds used to assign potability labels are NOT clearly documented in the Kaggle description. Do not use potability labels for regulatory compliance modelling.

### Time-Series Characteristics
None. Independent observations with no temporal ordering.

### SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | No process-level or temporal data |
| Water Quality Prediction | Limited | Feature reference only; labels unreliable |
| Predictive Maintenance | No | No device data |
| Anomaly Detection | Limited | Outlier detection on static readings only |

### Why It Is Useful
- Widely used in the ML community — easy to benchmark approaches against
- Covers several parameters also measured by SILVAPURE sensors (pH, turbidity, conductivity)
- Useful for rapid prototyping of feature preprocessing pipelines

### What It Cannot Be Used For
- Any production model training where label quality matters
- Regulatory compliance validation
- Wastewater treatment prediction (drinking water data)
- Time-series modelling
- Claims about Indian or any specific regional standards

### License
Kaggle datasets have individual licenses set by uploaders. The above dataset lists a license of **Unknown** or varies by version uploaded. **Do not redistribute or use commercially without verifying the original source license.**

### Recommended Use
- Exploratory data analysis and pipeline prototyping only
- Not recommended for SILVAPURE model training due to unclear provenance

---

## General Guidance for Kaggle Water Quality Datasets

When evaluating any Kaggle water quality dataset:

1. Check the "About" tab for a link to the original primary source
2. If no primary source is listed, treat as provenance-unverified
3. Check the license field — many Kaggle datasets are listed as "Unknown" which means redistribution rights are unclear
4. Prefer datasets that trace to EPA, USGS, CPCB, or peer-reviewed research data

## Preferred Alternatives
For SILVAPURE development, the following are preferred over Kaggle-sourced water quality data:
- UCI Water Treatment Plant (see `uci-water-treatment-plant.md`) — verified real data
- EPA Water Quality Portal (see `epa-water-quality-portal.md`) — verified real data, public domain
- data.gov.in datasets (see `data-gov-in-water-quality.md`) — India-specific, GODL licensed
