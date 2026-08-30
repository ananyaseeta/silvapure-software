# SILVAPURE Dataset Matrix

Last updated: 2026-07-26 (post-audit revision)

This matrix reflects all corrections applied during the 2026-07 audit. For the detailed rationale behind any correction, see `AUDIT.md`.

---

## Dataset Type Legend

| Type | Meaning |
|---|---|
| A | SILVAPURE-specific real telemetry (not yet collected) |
| B | Public real-world data |
| C | Synthetic or simulated data |
| D | General ML benchmark (not domain-specific) |

---

## 1. Dataset Overview

| # | Dataset | Type | Domain | Records | Features | Time-Series? | Resolution |
|---|---|---|---|---|---|---|---|
| 1 | UCI Water Treatment Plant | B | Municipal wastewater (European plant) | 527 daily records | 38 process measurements | Yes (daily) | Daily |
| 2 | Kaggle Water Potability | B or C (unverified) | Drinking water — physicochemical | 3,276 | 9 physicochemical | No | None |
| 3 | Kaggle Water Quality (mssmartypants) | B (provenance uncertain) | Drinking water — physicochemical | 7,999 | 20 physicochemical | No | None |
| 4 | EPA Water Quality Portal | B | US surface water / groundwater | 400M+ (query-filtered) | Varies | Yes (irregular) | Daily to annual |
| 5 | data.gov.in CPCB Water Quality | B | Indian surface water / industrial discharge | Varies by download | Varies | Yes (quarterly/annual) | Annual / quarterly |
| 6 | UCI AI4I 2020 | C | Industrial machine predictive maintenance | 10,000 | 14 total (5 continuous sensor features) | Sequential (no timestamps) | N/A |
| 7 | NASA CMAPSS | C | Turbofan engine degradation (simulated) | ~150K+ across 4 sub-datasets | 26 per sub-dataset | Yes (per-engine cycles) | Per cycle |
| 8 | PHM Society Challenges | B or C (per year) | Various industrial equipment | Varies by challenge year | Varies | Yes (high-frequency) | Hz to kHz |
| 9 | SWaT | B | Water treatment testbed (clean water) | ~946K total (LITERATURE-DERIVED) | 51 per sample | Yes (1-second) | 1 second |
| 10 | NAB | D | Infrastructure metrics, server load, environment | 365,551 (verified) across 58 files | Univariate per file | Yes | Seconds to hours |

### Notes on record counts and feature counts

- **UCI Water Treatment Plant:** 527 records verified from UCI ML Repository. 38 features includes some columns with heavy missingness (~15–30%).
- **Kaggle Water Potability:** 3,276 records, 9 features (pH, Hardness, Solids, Chloramines, Sulfate, Conductivity, Organic_carbon, Trihalomethanes, Turbidity). Source: `kaggle.com/datasets/adityakadiwal/water-potability`.
- **Kaggle Water Quality (mssmartypants):** 7,999 records, 20 features, binary `is_safe` target. Source: `kaggle.com/datasets/mssmartypants/water-quality`. Different dataset from above — do not merge.
- **UCI AI4I 2020:** 14 total columns: UDI (row ID), Product ID (categorical), Type (categorical), Air temperature, Process temperature, Rotational speed, Torque, Tool wear (5 continuous sensor features), plus 5 binary failure mode targets (TWF, HDF, PWF, OSF, RNF) and 1 Machine failure label. CC BY 4.0.
- **SWaT record counts:** ~496,800 normal operation (7 days × 86,400 s/day), ~449,919 attack scenarios (4 days, 36 attacks). These counts are LITERATURE-DERIVED from published academic papers. Not verified against raw files (access requires signed agreement with SUTD iTrust).
- **NAB:** 365,551 total data points across 58 files as stated in Lavin et al. (2015) and corroborated in published literature. Considered verified.
- **NASA CMAPSS:** Verified URL: `data.nasa.gov/dataset/cmapss-jet-engine-simulated-data`. PCOE legacy URL removed (redirects to unrelated content).
- **PHM Challenges:** No generic record count. Each challenge year is a different dataset. A specific challenge year must be selected before this source can be used.

---

## 2. SILVAPURE Model Applicability

| Dataset | Plant Health Scoring | Water Quality Prediction | Predictive Maintenance | Anomaly Detection |
|---|---|---|---|---|
| UCI Water Treatment Plant | ✅ Proxy | ✅ Primary proxy | ⚠️ Partial (proxy) | ✅ Proxy |
| Kaggle Water Potability | ❌ | ⚠️ Feature reference only | ❌ | ❌ |
| Kaggle Water Quality (mssmartypants) | ❌ | ⚠️ Feature reference only | ❌ | ❌ |
| EPA Water Quality Portal | ⚠️ Partial | ✅ Supplementary | ❌ | ⚠️ Supplementary |
| data.gov.in CPCB | ⚠️ Partial | ✅ India-relevant supplementary | ❌ | ⚠️ Supplementary |
| UCI AI4I 2020 | ❌ | ❌ | ✅ Primary proxy (classification) | ⚠️ Partial |
| NASA CMAPSS | ❌ | ❌ | ✅ Primary proxy (RUL) | ⚠️ Partial |
| PHM Challenges | ❌ | ❌ | ⚠️ Methodology reference only | ⚠️ Partial |
| SWaT | ⚠️ Partial (proxy) | ⚠️ Partial (proxy — clean water) | ❌ | ✅ Primary proxy |
| NAB | ❌ | ❌ | ⚠️ Methodology only | ✅ Evaluation framework |

**Key:** ✅ Applicable  /  ⚠️ Partial or methodology only  /  ❌ Not applicable

---

## 3. License and Access

| Dataset | License | Freely Downloadable? | Redistribution | Notes |
|---|---|---|---|---|
| UCI Water Treatment Plant | UCI ML Repository terms — verify; likely permissive | ✅ Yes | ⚠️ Verify before redistribution | Direct download, no registration |
| Kaggle Water Potability | CC0 Public Domain (per dataset page — verify) | ✅ Yes (Kaggle account) | ✅ Likely yes (verify CC0 terms) | `adityakadiwal/water-potability` |
| Kaggle Water Quality (mssmartypants) | Not clearly stated on dataset page | ✅ Yes (Kaggle account) | ⚠️ Verify before redistribution | `mssmartypants/water-quality` |
| EPA Water Quality Portal | US Federal Public Domain | ✅ Yes (API or bulk) | ✅ Yes (attribution recommended) | Registration optional |
| data.gov.in CPCB | Government Open Data License India (GODL) | ✅ Yes (registration) | ✅ Yes (with attribution) | GODL license URL was broken at audit — verify current URL at data.gov.in |
| UCI AI4I 2020 | CC BY 4.0 — verified | ✅ Yes | ✅ Yes (with attribution) | Direct download, no registration |
| NASA CMAPSS | US Government work — verify current NASA Open Data policy | ✅ Yes | ⚠️ Verify current NASA policy | data.nasa.gov account may be needed |
| PHM Challenges | Per-challenge (many restrict redistribution) | ⚠️ Varies | ❌ Generally restricted | Must register at phmsociety.org; read each challenge's terms |
| SWaT | SUTD iTrust academic research license | ❌ Requires formal request | ❌ Prohibited | Signed data usage agreement required. Raw files must NOT be committed to this repo. |
| NAB | Numenta Open Data License (verify per file) | ✅ Yes (GitHub) | ⚠️ Verify per file | Some NAB files sourced from third parties — check individual file provenance |

---

## 4. Data Quality and Completeness

| Dataset | Missing Values | Noise | Label Quality | Wastewater-Specific? |
|---|---|---|---|---|
| UCI Water Treatment Plant | Yes (~15–30% across features) | Real-world (moderate) | No labels — unsupervised/regression only | ✅ Yes — municipal wastewater treatment |
| Kaggle Water Potability | Yes (~10–15%) | Uncertain provenance | Binary potability label — methodology unverified | ❌ No — drinking water |
| Kaggle Water Quality (mssmartypants) | Yes (~few %) | Uncertain provenance | Binary `is_safe` — methodology unverified | ❌ No — drinking water, unverified provenance |
| EPA Water Quality Portal | Yes (station-dependent) | Real-world (varies by station) | Measured values, no fault labels | ❌ No — ambient monitoring |
| data.gov.in CPCB | Yes (varies) | Real-world | Measured compliance values | ⚠️ Partial — includes some industrial discharge data |
| UCI AI4I 2020 | None | Clean (synthetic) | ✅ High — multiple failure modes explicitly labelled | ❌ No — manufacturing equipment |
| NASA CMAPSS | None | Simulated (controlled noise) | ✅ High — RUL derived from run-to-failure simulation | ❌ No — aerospace |
| PHM Challenges | Varies by challenge | Varies | Varies | ❌ No — general industrial |
| SWaT | Minimal | Real-world (high fidelity testbed) | ✅ Labelled attack scenarios with ground truth | ⚠️ Partial — clean water treatment, not wastewater |
| NAB | Minimal | Real-world or artificial injection | ✅ Labelled anomaly windows | ❌ No — general infrastructure metrics |

---

## 5. Suitability by Training Phase

| Dataset | Phase 1 — Research (current) | Phase 2 — Pilot (SILVAPURE data available) | Phase 3 — Production |
|---|---|---|---|
| UCI Water Treatment Plant | ✅ Primary proxy | ⚠️ Supplementary feature reference | ❌ Replace with SILVAPURE telemetry |
| Kaggle Water Potability | ⚠️ Feature reference only | ❌ | ❌ |
| Kaggle Water Quality (mssmartypants) | ⚠️ Feature reference only | ❌ | ❌ |
| EPA Water Quality Portal | ✅ Parameter distribution reference | ⚠️ Supplementary | ❌ |
| data.gov.in CPCB | ✅ India-specific regulatory context | ⚠️ Supplementary for Indian context | ⚠️ External benchmark |
| UCI AI4I 2020 | ✅ Primary PM proxy (classification) | ❌ Replace with SILVAPURE device data | ❌ |
| NASA CMAPSS | ✅ Primary RUL proxy | ❌ Replace with SILVAPURE device data | ❌ |
| PHM Challenges | ⚠️ Methodology reference (select specific year) | ❌ | ❌ |
| SWaT | ✅ Anomaly detection methodology | ⚠️ Reference benchmarks only | ❌ |
| NAB | ✅ Evaluation framework (scoring methodology) | ⚠️ Scoring methodology reference | ⚠️ Scoring methodology reference |

---

## 6. Domain Proximity to SILVAPURE

Ranked by how closely each dataset matches SILVAPURE's operational environment: Indian ETP/STP wastewater treatment at hourly or sub-hourly resolution.

| Dataset | Domain Match | Reason |
|---|---|---|
| UCI Water Treatment Plant | ⭐⭐⭐⭐ | Real municipal wastewater, multi-stage process, time-series. European plant — different configuration from Indian ETP/STP. |
| data.gov.in CPCB | ⭐⭐⭐ | India-specific, real monitoring data. Ambient river/lake monitoring, not internal plant process data. |
| SWaT | ⭐⭐⭐ | Real water treatment process, 1-second resolution, labelled anomalies. Clean water, not wastewater. Cyber-attack focus differs from SILVAPURE's use case. |
| EPA Water Quality Portal | ⭐⭐ | Real water quality measurements. US context, mostly ambient monitoring, not plant-internal data. |
| Kaggle Water Potability | ⭐ | Drinking water parameters — different regulatory context, no process dynamics, provenance uncertain. |
| Kaggle Water Quality (mssmartypants) | ⭐ | Same limitations as above. Different feature set. |
| UCI AI4I 2020 | ⭐ | Manufacturing equipment — useful only as PM methodology proxy. No water treatment relevance. |
| NASA CMAPSS | ⭐ | Aerospace — useful only as RUL methodology proxy. |
| NAB | ⭐ | General time-series benchmark — useful for evaluation framework only. |
| PHM Challenges | ⭐ | Rotating industrial equipment — methodology proxy for pump/motor monitoring only. |

---

## 7. Dataset Duplication and Overlap Check

| Dataset Pair | Overlap? | Resolution |
|---|---|---|
| Kaggle Water Potability ↔ Kaggle Water Quality (mssmartypants) | No overlap — different datasets. 3,276 vs 7,999 records; different features. | Keep both, documented separately. |
| UCI Water Treatment Plant (water quality use) ↔ UCI Water Treatment Plant (anomaly detection use) | Same dataset, intentional dual-use | Not a duplicate — different modelling contexts. Both references are correct. |
| EPA Water Quality Portal ↔ data.gov.in CPCB | No overlap (different countries, different monitoring networks) | Both useful; serve different purposes. |
| UCI AI4I 2020 ↔ NASA CMAPSS | No overlap | Both needed: AI4I for failure classification, CMAPSS for RUL regression. |

---

## 8. Datasets That Must NOT Be Committed to This Repository

| Dataset | Reason | What Is Permitted |
|---|---|---|
| SWaT raw data files | SUTD iTrust data usage agreement prohibits redistribution | This documentation file only |
| PHM challenge files (most years) | Most PHM challenges restrict to registered participants | This category-level placeholder only |

---

## 9. Items Requiring Manual Verification Before Use

| Item | Issue | Action Required |
|---|---|---|
| UCI Water Treatment Plant license | UCI ML Repository does not always state an explicit license | Check current UCI page and cite the exact terms found |
| Kaggle Water Potability license | Listed as CC0 on Kaggle but verify before treating as freely redistributable | Confirm CC0 on the current dataset page |
| Kaggle Water Quality (mssmartypants) license | Not clearly stated | Check Kaggle dataset page for current license |
| data.gov.in GODL license URL | Official GODL URL was broken at time of audit | Search data.gov.in for current GODL text and verify link |
| NASA CMAPSS redistribution policy | NASA Open Data policy applies; verify current terms | Check data.nasa.gov terms of service |
| COD ≤ 250 mg/L (CPCB Schedule VI) | Cited in public summaries but not directly confirmed from current Official Gazette | Verify against current Schedule VI text at cpcb.nic.in/effluent-emission/ |
| SWaT record counts | Derived from published papers, not raw files | Verify when raw data access is obtained via SUTD agreement |
| PHM specific challenge selection | No specific challenge year has been evaluated yet | Select a specific challenge year, read its terms, and create a separate dataset document |

---

## 10. Quick Selection Guide

**Water quality prediction, starting now:**
→ **UCI Water Treatment Plant** — only publicly available real wastewater process time-series. Accept daily resolution and European plant context.

**India-specific water quality context:**
→ **data.gov.in CPCB** — verify GODL license before redistribution.

**Failure classification model:**
→ **UCI AI4I 2020** — CC BY 4.0, clean, well-labelled synthetic data, 10,000 records.

**Remaining Useful Life (RUL) regression:**
→ **NASA CMAPSS** — verify current NASA open data terms at `data.nasa.gov`.

**Anomaly detection methodology:**
→ **NAB** for evaluation framework. Apply for **SWaT** access for water-treatment-specific anomaly research.

**Do NOT use:**
→ Either Kaggle water quality dataset as a primary training source (unverified labelling methodology).
→ PHM challenge data without reading the specific challenge's usage terms.
→ Any dataset as the sole basis for regulatory compliance claims — verify applicable Indian standards with a qualified environmental engineer.
