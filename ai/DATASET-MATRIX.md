# SILVAPURE Dataset Matrix

This matrix compares all candidate datasets across the dimensions most relevant to SILVAPURE model development. Read each section carefully before selecting a dataset for a task.

---

## 1. Dataset Overview

| Dataset | Domain | Type | Records | Time-Series? | Temporal Resolution |
|---|---|---|---|---|---|
| UCI Water Treatment Plant | Municipal wastewater treatment (Europe) | Real | 527 daily records | Yes (daily) | Daily |
| UCI Water Quality (drinking water) | Drinking water — physicochemical | Uncertain / possibly synthetic | ~3,276 (Kaggle variant) | No | None |
| EPA Water Quality Portal | US surface water, groundwater | Real (US federal monitoring) | 400M+ records (query-filtered) | Yes (irregular) | Varies: daily to annual |
| data.gov.in CPCB | Indian surface water, industrial discharge | Real (Indian government monitoring) | Varies by dataset | Yes (quarterly/annual) | Annual / quarterly |
| Kaggle Water Quality | Drinking water — physicochemical | Uncertain — provenance unverified | ~3,276 | No | None |
| UCI AI4I 2020 | Industrial machine maintenance | Synthetic (explicitly stated) | 10,000 | Sequential (no timestamps) | N/A |
| NASA CMAPSS | Turbofan jet engine degradation | Simulated | ~150K+ across 4 sub-datasets | Yes (per-engine cycles) | Per-cycle |
| PHM Society Challenges | Various industrial equipment | Varies by year (real or simulated) | Varies | Yes (high-frequency) | Hz to kHz |
| SWaT | Water treatment (clean water) | Real (testbed) | ~950K total | Yes (1-second) | 1 second |
| NAB | Infrastructure metrics, environment | Mix (real + artificial) | ~365K total | Yes | Seconds to hours |
| UCI WTP (anomaly use) | Municipal wastewater (same as row 1) | Real | 527 | Yes (daily) | Daily |

---

## 2. SILVAPURE Model Applicability

| Dataset | Plant Health Scoring | Water Quality Prediction | Predictive Maintenance | Anomaly Detection |
|---|---|---|---|---|
| UCI Water Treatment Plant | ✅ Proxy | ✅ Primary proxy | ⚠️ Partial (proxy) | ✅ Proxy |
| UCI Water Quality (drinking water) | ❌ | ⚠️ Feature reference only | ❌ | ⚠️ Partial |
| EPA Water Quality Portal | ⚠️ Partial | ✅ Supplementary | ❌ | ⚠️ Supplementary |
| data.gov.in CPCB | ⚠️ Partial | ✅ India-relevant supplementary | ❌ | ⚠️ Supplementary |
| Kaggle Water Quality | ❌ Not recommended | ❌ Not recommended | ❌ | ❌ |
| UCI AI4I 2020 | ❌ | ❌ | ✅ Primary proxy (classification) | ⚠️ Partial |
| NASA CMAPSS | ❌ | ❌ | ✅ Primary proxy (RUL) | ⚠️ Partial |
| PHM Society Challenges | ❌ | ❌ | ⚠️ Methodology reference | ⚠️ Partial |
| SWaT | ⚠️ Partial (proxy) | ⚠️ Partial (proxy) | ❌ | ✅ Primary proxy |
| NAB | ❌ | ❌ | ⚠️ Methodology only | ✅ Evaluation framework |

**Key:** ✅ Applicable / ⚠️ Partial or methodology only / ❌ Not applicable / ❌ Not recommended

---

## 3. License and Access

| Dataset | License | Freely Downloadable? | Redistribution Permitted? | Access Restriction |
|---|---|---|---|---|
| UCI Water Treatment Plant | UCI ML Repository terms (verify; likely CC BY 4.0 or similar) | ✅ Yes | ⚠️ Verify before redistribution | None — direct download |
| UCI Water Quality (drinking water) | UCI ML Repository terms (verify) | ✅ Yes | ⚠️ Verify before redistribution | None — direct download |
| EPA Water Quality Portal | US Federal Public Domain | ✅ Yes (API or bulk download) | ✅ Yes (with attribution) | Registration optional |
| data.gov.in CPCB | Government Open Data License India (GODL) | ✅ Yes | ✅ Yes (with attribution) | Free registration |
| Kaggle Water Quality | Unknown / Unverified | ✅ Yes (Kaggle account required) | ❌ Do not redistribute without tracing to primary source | Kaggle account |
| UCI AI4I 2020 | CC BY 4.0 | ✅ Yes | ✅ Yes (with attribution) | None — direct download |
| NASA CMAPSS | US Federal Public Domain (verify current terms) | ✅ Yes | ⚠️ Verify current NASA Open Data policy | data.nasa.gov registration |
| PHM Society Challenges | Per-challenge (many restrict redistribution) | ⚠️ Varies by challenge year | ❌ Generally restricted | phmsociety.org registration required |
| SWaT | Academic research license (SUTD iTrust) | ❌ Requires formal request | ❌ Prohibited | Signed data usage agreement with SUTD |
| NAB | Numenta Open Data License (verify per file) | ✅ Yes | ⚠️ Verify per file | None — GitHub download |

---

## 4. Data Quality and Completeness

| Dataset | Missing Values? | Noise Level | Label Quality | Wastewater-Specific? |
|---|---|---|---|---|
| UCI Water Treatment Plant | Yes (~15–30% across features) | Real-world (moderate) | No labels — unsupervised target | ✅ Yes — municipal wastewater |
| UCI Water Quality (drinking water) | Yes (~15–20%) | Uncertain (possibly synthetic) | Binary potability — unverified labelling methodology | ❌ No — drinking water |
| EPA Water Quality Portal | Yes (station-dependent) | Real-world (varies) | Measured values, no fault labels | ❌ No — ambient monitoring |
| data.gov.in CPCB | Yes (varies by dataset) | Real-world | Measured compliance values | ⚠️ Partial — includes some industrial discharge |
| Kaggle Water Quality | Yes (~15–20%) | Uncertain | Binary labels — methodology unclear | ❌ No — drinking water, unverified |
| UCI AI4I 2020 | None | Clean (synthetic) | ✅ High quality (multiple failure modes labelled) | ❌ No — manufacturing |
| NASA CMAPSS | None | Simulated (controlled) | ✅ High quality (RUL derived from run-to-failure) | ❌ No — aerospace |
| PHM Society Challenges | Varies by challenge | Varies | Varies | ❌ No — industrial |
| SWaT | Minimal | Real-world (high fidelity) | ✅ Labelled attack scenarios (ground truth) | ⚠️ Partial — clean water treatment |
| NAB | Minimal | Real-world or artificial | ✅ Labelled anomaly windows | ❌ No — infrastructure/general |

---

## 5. Suitability for Each Training Phase

| Dataset | Phase 1 (Research) | Phase 2 (Pilot — real SILVAPURE data) | Phase 3 (Production) |
|---|---|---|---|
| UCI Water Treatment Plant | ✅ Primary proxy | ⚠️ Supplementary feature reference | ❌ Replace with SILVAPURE data |
| UCI Water Quality | ⚠️ Feature reference only | ❌ | ❌ |
| EPA Water Quality Portal | ✅ Parameter distribution reference | ⚠️ Supplementary | ❌ |
| data.gov.in CPCB | ✅ India-specific context | ⚠️ Supplementary for Indian standards | ⚠️ External benchmark |
| Kaggle Water Quality | ❌ Not recommended | ❌ | ❌ |
| UCI AI4I 2020 | ✅ Primary PM proxy | ❌ Replace with SILVAPURE device data | ❌ |
| NASA CMAPSS | ✅ Primary RUL proxy | ❌ Replace with SILVAPURE device data | ❌ |
| PHM Challenges | ⚠️ Methodology reference | ❌ | ❌ |
| SWaT | ✅ Anomaly detection methodology | ⚠️ Reference benchmarks only | ❌ |
| NAB | ✅ Evaluation framework | ⚠️ Scoring methodology reference | ⚠️ Scoring methodology reference |

---

## 6. Domain Proximity to SILVAPURE

This section ranks each dataset on how closely its domain matches SILVAPURE's actual operational environment (Indian ETP/STP wastewater treatment).

| Dataset | Domain Match | Notes |
|---|---|---|
| UCI Water Treatment Plant | ⭐⭐⭐⭐ | Real municipal wastewater, multi-stage process. European context. |
| data.gov.in CPCB | ⭐⭐⭐ | India-specific, but ambient monitoring not internal process data |
| SWaT | ⭐⭐⭐ | Real water treatment process, high resolution, but clean water and cyber-attack focus |
| EPA Water Quality Portal | ⭐⭐ | Real water quality but US context, mostly ambient not process data |
| UCI Water Quality (drinking water) | ⭐ | Drinking water, different regulatory context, no process data |
| Kaggle Water Quality | ⭐ | Unverified provenance — not recommended |
| UCI AI4I 2020 | ⭐ | Manufacturing context but useful methodology proxy |
| NASA CMAPSS | ⭐ | Aerospace — useful only as RUL methodology proxy |
| NAB | ⭐ | General time-series benchmark — useful only as evaluation proxy |
| PHM Challenges | ⭐ | Industrial rotating equipment — methodology proxy only |

---

## 7. Dataset Duplication and Overlap

| Dataset Pair | Overlap? | Resolution |
|---|---|---|
| UCI Water Quality (UCI) ↔ Kaggle Water Quality | High overlap — likely same underlying data | Use UCI version only; treat Kaggle version as duplicate with unclear provenance |
| UCI Water Treatment Plant (water quality) ↔ UCI Water Treatment Plant (anomaly) | Same dataset, different use | This is intentional dual-use documentation; no duplication |
| EPA Water Quality Portal ↔ data.gov.in CPCB | No overlap (different countries) | Both useful; EPA for method reference, data.gov.in for India context |
| UCI AI4I 2020 ↔ NASA CMAPSS | No overlap (different domains) | Both needed: AI4I for classification, CMAPSS for RUL regression |

---

## 8. Quick Selection Guide

**I need to train a water quality prediction model right now with available data:**
→ Start with **UCI Water Treatment Plant**. It is the only publicly available real wastewater process time-series dataset. Accept its limitations (daily resolution, European context).

**I need India-specific water quality context:**
→ Use **data.gov.in CPCB** datasets. Check the GODL license before redistribution.

**I need to build a failure classification model:**
→ Use **UCI AI4I 2020** (CC BY 4.0, clean, well-labelled synthetic data).

**I need to build a Remaining Useful Life estimator:**
→ Use **NASA CMAPSS** (verify current NASA open data license).

**I need to develop an anomaly detection approach:**
→ Use **NAB** for evaluation methodology. Apply for **SWaT** access for water-treatment-specific anomaly research.

**I have limited time and need a quick feature engineering reference:**
→ **UCI Water Treatment Plant** for process features; **EPA Water Quality Portal** API for parameter distribution reference.

**I should NOT use:**
→ **Kaggle Water Quality** (unverified provenance, unclear license).
→ **PHM Challenges** without first reading the specific challenge's data usage terms.
→ Any dataset for regulatory compliance claims without verifying applicable Indian standards with a qualified environmental engineer.
