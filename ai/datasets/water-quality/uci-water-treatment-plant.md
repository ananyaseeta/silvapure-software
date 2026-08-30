# UCI Water Treatment Plant Dataset

## Classification
**Type B — Public real-world data**

> **RAW DATA NOT INCLUDED** — License verification must be requested from UCI before redistribution.
> Contact: ml-repository@ics.uci.edu | See "License Verification Required" section below.

---

## Official Name
Water Treatment Plant (water-treatment.data)

## Official Source
UCI Machine Learning Repository — Center for Machine Learning and Intelligent Systems, University of California Irvine

## Verified URL
**Primary (verified working):**
https://archive.ics.uci.edu/ml/datasets/Water

**Note on URLs:** The new UCI ML Repository site uses numeric IDs in the format `archive.ics.uci.edu/dataset/<id>/`. The old-format URL above (`/ml/datasets/Water`) was verified live as of the audit date. The numeric ID for this dataset is listed in older literature as ID 207, but that path returns HTTP 404 on the new site. Use the `/ml/datasets/Water` path until the new-format URL is confirmed.

## Dataset Type
Real — collected from an operational urban wastewater treatment plant in a real city. This is not simulated or synthetic data.

## Domain
Municipal wastewater treatment — biological treatment (activated sludge process). This is the **only publicly available real-world operational wastewater treatment plant time-series dataset** among the candidate datasets in this repository.

**Important:** This dataset is from a European municipal STP. It does not represent industrial ETP operations, pharmaceutical wastewater, textile effluent, or Indian regulatory conditions. These are real limitations — not guesses.

## Number of Records
**Approximately 527 daily observations** (approximately 2 years of daily plant readings).

**Verification status:** This count appears consistently in published literature and the UCI dataset description, but the original source URL has moved. Consider it reliable but mark as LITERATURE-DERIVED until the new UCI page is confirmed live and the count is visible there.

## Features
38 sensor and process measurements across four treatment stages. Feature names in the raw file are coded (V1–V38 in some distributions). The mapping per UCI documentation:

| Code range | Stage |
|---|---|
| V1–V8 | Inlet (raw wastewater) |
| V9–V16 | Primary settler |
| V17–V24 | Aeration tank (biological) |
| V25–V32 | Secondary settler |
| V33–V38 | Effluent (output) |

Parameters include: Suspended Solids (SS), Sedimentation (SED), Conductivity (COND), pH, BOD (DBO in Spanish), COD (DQO), flow rates.

**Missing values:** Indicated by `?` in the raw file. Approximately 15–30% of values are missing across features. This is a real characteristic of the data, not an error.

## Target Variable
No single designated target. Depending on the task:
- Effluent quality prediction: DBO_E (effluent BOD), DQO_E (effluent COD), SS_E (effluent suspended solids)
- Process state classification: operational state of the plant
- Anomaly detection: no labels — unsupervised

## Time-Series Characteristics
- Daily resolution
- Records are in chronological order (row order = day order; no explicit timestamp column)
- Approximately 2-year span
- Short autocorrelation window (biological treatment cycles are 1–7 days)
- Missing value clusters likely correspond to sensor faults or maintenance periods

## SILVAPURE Model Applicability

| Model | Applicable | Confidence | Notes |
|---|---|---|---|
| Plant Health Scoring | Yes — proxy | Medium | Multi-stage process measurements; no explicit health labels |
| Water Quality Prediction | Yes — primary proxy | Medium-High | Effluent quality prediction is directly the intended use |
| Predictive Maintenance | Partial — indirect proxy | Low | Missing value patterns can simulate sensor degradation |
| Anomaly Detection | Yes — proxy | Medium | Unsupervised anomaly detection on real wastewater data |

## Why It Is Useful
This is the **most domain-relevant publicly available dataset for SILVAPURE research**. It provides:
- Real operational data from a multi-stage wastewater treatment process
- Input → treatment stage → effluent measurement chain that directly mirrors SILVAPURE's `TreatmentPlant` → `Sensor` → `Telemetry` hierarchy
- Missing value patterns that make preprocessing pipelines realistic
- A time-series structure suitable for lag-feature and sequence model development

## Limitations and What It Cannot Be Used For
- **Daily resolution only.** Sub-daily or real-time process dynamics are not captured.
- **European municipal STP.** Treatment configuration, feedstock, and regulatory thresholds differ from Indian ETP/STP facilities.
- **No explicit anomaly labels.** Anomaly detection must be unsupervised.
- **No device-level metadata.** Predictive maintenance requires device-specific features not present here.
- **~2 years of data.** Insufficient to capture multi-year seasonal patterns.
- **Not wastewater-specific for Indian regulatory thresholds.** Do not use parameter ranges as proxies for CPCB compliance without verifying applicable Indian standards.

## Preprocessing Required
1. Parse `?` as `NaN` on CSV load
2. Sort by row order (chronological) — no timestamp column exists
3. Impute missing values: forward-fill for gaps ≤ 4 records, median imputation for longer gaps (training-set statistics only)
4. Exclude records where more than 30% of features are missing
5. Normalise continuous features using training-set mean and std only
6. For tabular models: build lag features (t-1, t-3, t-6, t-12, t-24)
7. For sequence models: sliding window of length W (tune 7–30)

## Feature Engineering Possibilities
- Effluent removal efficiency ratios: (inlet_BOD - effluent_BOD) / inlet_BOD
- DQO/DBO ratio (biodegradability index)
- Rolling mean and std over 7, 14, 30-day windows
- Day-over-day difference features
- Stage-to-stage transfer efficiency features

## License

License verification must be requested from the UCI Machine Learning Repository because this dataset was donated in 1993 and its current redistribution license is not explicitly specified on the accessible UCI source.

The UCI donation policy page confirms that **newly donated** datasets are assigned CC BY 4.0. However, this dataset predates that policy. No explicit license field is visible on the current accessible UCI page for dataset ID 207. The dataset has been freely used in academic research for over 30 years, but that does not constitute a verified redistribution grant.

**Official source:** https://archive.ics.uci.edu/ml/datasets/Water
**UCI ML Repository contact:** ml-repository@ics.uci.edu

## License Verification Required

Before publicly redistributing the raw UCI Water Treatment Plant dataset files, explicit confirmation must be obtained from the UCI Machine Learning Repository.

**Action required:**
1. Email ml-repository@ics.uci.edu
2. Reference dataset ID 207 — "Water Treatment Plant" (donated 1993, Bejar/Cortes/Poch)
3. Ask: Is this dataset covered under CC BY 4.0 or another explicit redistribution license?
4. Record the response and update this document with the confirmed license

**Until that confirmation is received:**
- Raw dataset files (`water-treatment.data`, `water-treatment.names`) are NOT included in this repository
- The dataset may be downloaded directly from the official UCI URL for local research use
- Do not commit raw files here until the license response is documented

## Redistribution Restrictions
**NOT CLEARED FOR REDISTRIBUTION** — pending license confirmation from UCI.

The raw dataset files are intentionally excluded from this repository. See "License Verification Required" section above. Once UCI confirms the applicable license, update this document and add the raw files to `water-quality/raw/`.

## Recommended Use
- Primary proxy dataset for Water Quality Prediction research (Phase 1)
- Preprocessing pipeline validation
- Anomaly detection baseline development
- Feature engineering pattern development

## Citation
Bejar, J., Cortes, U., Poch, M. (1993). LINNEO+: A Classification Methodology for Ill-Structured Domains. Research Report, Llenguatges i Sistemes Informatics, Universitat Politecnica de Catalunya.

UCI Repository standard citation:
Dua, D. and Graff, C. (2019). UCI Machine Learning Repository. Irvine, CA: University of California, School of Information and Computer Science. http://archive.ics.uci.edu/ml
