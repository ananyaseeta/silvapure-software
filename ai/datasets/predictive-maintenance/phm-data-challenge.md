# PHM Society Data Challenge Datasets

## Classification
**Type B/C — Real industrial data (some challenges) or Simulated data (other challenges)**

**This is a category-level placeholder document, not a specific dataset.**
A specific PHM challenge year must be selected and documented separately before this source can be used in SILVAPURE research. Different challenge years have different data types, licenses, record counts, and redistribution restrictions.

---

## Official Name
PHM Society Data Challenge Datasets (various years)

## Official Source
Prognostics and Health Management (PHM) Society

## URL
https://phmsociety.org/phm-society-conference/annual-conference/data-challenge/

## Dataset Type
Varies by year — mix of real industrial data (some anonymised) and simulated data. Dataset type is specified per challenge year.

## Domain
Industrial prognostics and health management — various industrial equipment types depending on the challenge year. Relevant years for SILVAPURE:
- PHM 2014: Battery degradation (simulated)
- PHM 2016: Ultrasonic data for structural damage (real, materials)
- PHM 2021: Bearing fault detection — potentially relevant for pump bearing monitoring

Individual challenge details must be verified at the source URL above.

## Number of Records
Varies significantly by challenge year and dataset. Some challenges provide gigabytes of raw sensor data; others are tabular and compact. **Do not use a generic record count — check the specific challenge year.**

## Features
Depends entirely on the specific challenge. PHM challenges related to rotating equipment (bearings, gears) commonly include:
- Vibration time-series (accelerometer data at high sampling frequency)
- Temperature readings
- Speed/RPM signals
- Load conditions
- Fault labels (for supervised challenges)

## Target Variable
Varies: fault classification, RUL estimation, anomaly probability, or fault localisation, depending on the challenge.

## Time-Series Characteristics
High-frequency sensor data is common in PHM challenges. Vibration data may be sampled at kHz frequencies. This is a fundamentally different temporal resolution from SILVAPURE's operational telemetry (seconds to minutes).

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | Equipment-level, not plant-level |
| Water Quality Prediction | No | No water quality parameters |
| Predictive Maintenance | Partial (methodology proxy) | Specific challenges relevant to pump/motor monitoring |
| Anomaly Detection | Partial (methodology proxy) | Bearing fault onset as anomaly detection proxy |

## Why It Is Useful
- Some PHM challenges specifically target pump/motor degradation relevant to wastewater pumps
- Provides methodology benchmarks for vibration-based maintenance approaches
- Community-validated baselines available

## What It Cannot Be Used For
- Water quality prediction
- Direct application to SILVAPURE without significant domain validation
- Any challenge dataset labeled "competition use only" cannot be used outside the competition context

## Preprocessing Required
Challenge-specific. High-frequency vibration data typically requires:
- Frequency domain transformation (FFT, spectral features)
- Statistical feature extraction (RMS, kurtosis, crest factor) from raw signal
- Windowing and segmentation

## License and Access Restrictions
**IMPORTANT: PHM challenge dataset licenses vary by year and challenge.**

Many PHM Society datasets are made available only for competition participants and subsequent research purposes, NOT for commercial use. Some datasets explicitly prohibit redistribution.

**Before using any PHM dataset:**
1. Register at phmsociety.org
2. Read the specific dataset's terms of use for that challenge year
3. Do not assume any PHM dataset is freely redistributable
4. Do not commit PHM dataset files to this repository without verifying redistribution rights

## Redistribution Restrictions
**Do NOT redistribute PHM dataset files without verifying terms per challenge year.** Many challenges restrict datasets to registered participants and prohibit redistribution.

## Recommended Use
- Reference methodology benchmarks only
- If a specific PHM challenge dataset with permissive terms is identified, document it separately with its specific URL, terms, and citation
- This document serves as a category-level placeholder — replace with a specific challenge year document when a suitable dataset is identified

## Citation
PHM Society. Annual Data Challenge. Available at https://phmsociety.org/phm-society-conference/annual-conference/data-challenge/

Individual challenge citations should reference the specific challenge year proceedings.
