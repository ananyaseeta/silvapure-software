# SILVAPURE AI — Datasets

This directory contains raw dataset files and access/documentation files for all candidate datasets identified for SILVAPURE AI model research.

Raw data is included **only where redistribution has been verified as permitted**. For all other datasets, an access or documentation file explains how to obtain the data and why raw files are not included.

---

## Dataset Summary

| Dataset | Category | SILVAPURE Model | Raw Data in Repo | Access Required | Notes |
|---|---|---|---|---|---|
| **UCI AI4I 2020** | predictive-maintenance | Predictive Maintenance | ✅ **Included** | No | CC BY 4.0 verified |
| **NASA CMAPSS** | predictive-maintenance | Predictive Maintenance (RUL) | ✅ **Included** | No | US public domain / CC0 |
| **NAB** | anomaly-detection | Anomaly Detection (evaluation) | ✅ **Included** | No | MIT license |
| UCI Water Treatment Plant | water-quality | Water Quality Prediction, Anomaly Detection | ❌ Not included | Email UCI | License verification must be requested from UCI (donated 1993, license not explicitly stated) |
| SWaT | anomaly-detection | Anomaly Detection | ❌ Not included | iTrust/SUTD formal request | Redistribution prohibited by data usage agreement |
| PHM Society Challenges | predictive-maintenance | Predictive Maintenance (methodology) | ❌ Not included | phmsociety.org registration | License per challenge year; most restrict redistribution; no specific year selected yet |
| Kaggle Water Potability | water-quality | Feature reference only | ❌ Not included | Kaggle account | License unverified; account required to download |
| Kaggle Water Quality (mssmartypants) | water-quality | Feature reference only | ❌ Not included | Kaggle account | License not stated; account required to download |
| EPA Water Quality Portal | water-quality | Water Quality Prediction (supplementary) | ❌ Not included | None (query-based) | No single file — 400M+ records, query-based portal |
| data.gov.in CPCB | water-quality | Water Quality Prediction (India context) | ❌ Not included | Free registration | Portal-based; multiple individual datasets; GODL license URL broken at audit |

---

## INCLUDED — Raw Data Files

These datasets have verified redistribution licenses and are included directly.

### UCI AI4I 2020 Predictive Maintenance
- **Path:** `predictive-maintenance/raw/ai4i2020.csv`
- **License:** Creative Commons Attribution 4.0 International (CC BY 4.0) — verified
- **Size:** ~510 KB
- **Records:** 10,000 synthetic industrial machine records
- **Source:** https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset
- **Attribution:** Stephan Matzka (2020). AI4I 2020 Predictive Maintenance Dataset. UCI ML Repository. https://doi.org/10.24432/C5HS5C

### NASA CMAPSS Turbofan Engine Degradation
- **Path:** `predictive-maintenance/raw/CMAPSSData.zip`
- **License:** US Federal Government public domain / CC0 — verified (NASA open data policy)
- **Size:** ~12 MB
- **Contents:** FD001–FD004 train/test/RUL files + readme + paper PDF
- **Source:** https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data
- **Attribution:** Saxena, A., Goebel, K., Simon, D., Eklund, N. (2008). PHM08 Conference.

### NAB — Numenta Anomaly Benchmark
- **Path:** `anomaly-detection/raw/nab-data/`
- **License:** MIT License — verified (see `nab-data/LICENSE.txt`)
- **Size:** ~9.2 MB (59 CSV files + 10 label JSON files)
- **Records:** 365,551 total data points across 58 time series
- **Source:** https://github.com/numenta/NAB
- **Attribution:** Lavin, A., Ahmad, S. (2015). IEEE ICMLA 2015.
- **Note:** `LICENSE.txt` and `README.md` are included with the data files as required by the MIT license

---

## DOCUMENTATION ONLY — Raw Data Not Included

### UCI Water Treatment Plant
- **Documentation:** `water-quality/uci-water-treatment-plant.md`
- **Access instructions:** `water-quality/raw/UCI-WTP-ACCESS.md`
- **Why not included:** License verification must be requested from the UCI Machine Learning Repository because this dataset was donated in 1993 and its current redistribution license is not explicitly specified on the accessible UCI source.
- **Contact:** ml-repository@ics.uci.edu — reference dataset ID 207
- **Official URL:** https://archive.ics.uci.edu/ml/datasets/Water
- **Action:** Email UCI, confirm license, then add `water-treatment.data` and `water-treatment.names` to `water-quality/raw/`

### SWaT — Secure Water Treatment Dataset
- **Documentation:** `anomaly-detection/swat.md`
- **Access instructions:** `anomaly-detection/SWaT-ACCESS.md`
- **Why not included:** Redistribution is prohibited by the SUTD iTrust data usage agreement
- **Access:** https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/

### PHM Society Challenge Datasets
- **Documentation:** `predictive-maintenance/phm-data-challenge.md`
- **Access instructions:** `predictive-maintenance/raw/PHM-ACCESS.md`
- **Why not included:** Most challenge years restrict redistribution; no specific challenge year has been selected yet
- **Access:** https://phmsociety.org/phm-society-conference/annual-conference/data-challenge/

### Kaggle Water Potability
- **Documentation:** `water-quality/uci-water-quality-prediction.md`
- **Access instructions:** `water-quality/raw/KAGGLE-ACCESS.md`
- **Why not included:** Requires Kaggle account to download; license unverified
- **URL:** https://www.kaggle.com/datasets/adityakadiwal/water-potability

### Kaggle Water Quality (mssmartypants)
- **Documentation:** `water-quality/kaggle-water-quality.md`
- **Access instructions:** `water-quality/raw/KAGGLE-ACCESS.md`
- **Why not included:** Requires Kaggle account to download; license not stated
- **URL:** https://www.kaggle.com/datasets/mssmartypants/water-quality

### EPA Water Quality Portal
- **Documentation:** `water-quality/epa-water-quality-portal.md`
- **Access instructions:** `water-quality/raw/EPA-ACCESS.md`
- **Why not included:** No single download file — query-based portal with 400M+ records
- **URL:** https://www.waterqualitydata.us/

### data.gov.in CPCB Water Quality
- **Documentation:** `water-quality/data-gov-in-water-quality.md`
- **Access instructions:** `water-quality/raw/DATAGOV-IN-ACCESS.md`
- **Why not included:** Portal-based; multiple individual datasets; no single canonical file
- **URL:** https://data.gov.in/search?title=water+quality

---

## Directory Structure

```
datasets/
├── README.md                              ← this file
├── .gitignore                             ← blocks restricted/uncleared files
│
├── water-quality/
│   ├── uci-water-treatment-plant.md       ← documentation; raw data NOT included (license pending)
│   ├── uci-water-quality-prediction.md    ← Kaggle Water Potability documentation
│   ├── kaggle-water-quality.md            ← Kaggle mssmartypants documentation
│   ├── data-gov-in-water-quality.md
│   ├── epa-water-quality-portal.md
│   └── raw/
│       ├── UCI-WTP-ACCESS.md              ← download + license verification instructions
│       ├── KAGGLE-ACCESS.md               ← Kaggle download instructions
│       ├── EPA-ACCESS.md                  ← EPA portal query instructions
│       └── DATAGOV-IN-ACCESS.md           ← data.gov.in access instructions
│
├── predictive-maintenance/
│   ├── uci-ai4i-2020.md
│   ├── nasa-cmapss.md
│   ├── phm-data-challenge.md
│   └── raw/
│       ├── ai4i2020.csv                   ← INCLUDED (CC BY 4.0)
│       ├── CMAPSSData.zip                 ← INCLUDED (US public domain / CC0)
│       └── PHM-ACCESS.md                  ← PHM access instructions
│
└── anomaly-detection/
    ├── nab.md
    ├── swat.md
    ├── SWaT-ACCESS.md                     ← SWaT access instructions (redistribution prohibited)
    ├── uci-wastewater-anomaly.md
    └── raw/
        └── nab-data/                      ← INCLUDED (MIT license)
            ├── data/                      ← 59 time-series CSV files
            ├── labels/                    ← anomaly label JSON files
            ├── LICENSE.txt                ← MIT license (required with redistribution)
            └── README.md                  ← NAB data provenance notes
```

---

## License Attribution

All included datasets require attribution:

**UCI AI4I 2020 (CC BY 4.0):**
> Stephan Matzka (2020). AI4I 2020 Predictive Maintenance Dataset. UCI Machine Learning Repository. https://doi.org/10.24432/C5HS5C

**NASA CMAPSS:**
> Saxena, A., Goebel, K., Simon, D., and Eklund, N. (2008). Damage Propagation Modeling for Aircraft Engine Run-to-Failure Simulation. PHM08 Conference, Denver CO.

**NAB (MIT License — copyright notice must be preserved):**
> Copyright 2014–2024 Numenta Inc. See `anomaly-detection/raw/nab-data/LICENSE.txt`.
> Lavin, A., Ahmad, S. (2015). Evaluating Real-time Anomaly Detection Algorithms — the Numenta Anomaly Benchmark. IEEE ICMLA 2015.
