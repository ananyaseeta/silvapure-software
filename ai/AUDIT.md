# SILVAPURE AI Repository Audit Report

Audit date: 2026-07-26
Auditor: AI repository review (automated + manual verification where possible)
Scope: All files under `ai/` — dataset documentation, model documentation, references, training strategy, preprocessing plan, data requirements
Out of scope: `backend/`, `frontend/` — not modified

---

## Summary

| Category | Count |
|---|---|
| Critical issues fixed | 6 |
| Significant issues fixed | 4 |
| Items requiring manual verification | 8 |
| Datasets that must not be committed | 2 |
| Files modified during audit | 12 |

---

## Issues Fixed

### Fix 1 — UCI Water Treatment Plant: broken URL and classification

**File:** `datasets/water-quality/uci-water-treatment-plant.md`
**Issue (CRITICAL):** Dataset URL pointed to `/dataset/207/` which returns 404.
**Fix:** URL updated to `https://archive.ics.uci.edu/ml/datasets/Water+Treatment+Plant` (verified accessible).
**Additional:** Classification header added (Type B — real data). Applicability to SILVAPURE clearly stated: relevant as a wastewater process time-series proxy; European municipal plant, not an Indian ETP/STP. License noted as uncertain — UCI does not always state an explicit license; manual verification required.

---

### Fix 2 — UCI Water Quality Prediction: false UCI attribution removed

**File:** `datasets/water-quality/uci-water-quality-prediction.md`
**Issue (CRITICAL):** Document claimed a UCI dataset ID of 374 for a water quality dataset. UCI ID 374 does not resolve to a water quality dataset. The description matched the Kaggle Water Potability dataset (adityakadiwal), not a UCI dataset.
**Fix:** Document rewritten as the Kaggle Water Potability dataset. UCI attribution removed. Correct source documented: `kaggle.com/datasets/adityakadiwal/water-potability`. Record count corrected to 3,276. Feature count corrected to 9. Target variable corrected to binary `Potability`. Classification header added (Type B or C — provenance uncertain).

---

### Fix 3 — Kaggle Water Quality: wrong dataset described

**File:** `datasets/water-quality/kaggle-water-quality.md`
**Issue (CRITICAL):** Document described a dataset with record counts and features that did not match the URL provided. The URL pointed to `mssmartypants/water-quality` (7,999 records, 20 features, binary `is_safe` target), not the adityakadiwal potability dataset.
**Fix:** Document rewritten to accurately describe the mssmartypants dataset: 7,999 records, 20 physicochemical features, binary `is_safe` target. Classification header added (Type B — provenance uncertain). The two Kaggle datasets are now distinct documents describing distinct datasets. They must not be merged or treated as the same dataset.

---

### Fix 4 — NASA CMAPSS: broken PCOE URL and software/dataset confusion

**File:** `datasets/predictive-maintenance/nasa-cmapss.md`
**Issue (CRITICAL):** Legacy PCOE URL (`ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/`) was dead and redirected to unrelated NASA content.
**Fix:** URL updated to the verified current location: `https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data`. PCOE link removed entirely. Note added clarifying that CMAPSS refers to both a simulation software tool and to the simulated dataset derived from it; SILVAPURE uses the dataset, not the software.

---

### Fix 5 — data.gov.in: broken GODL license URL

**File:** `datasets/water-quality/data-gov-in-water-quality.md`
**Issue (SIGNIFICANT):** The Government Open Data License (GODL) URL cited in the document was broken at the time of audit.
**Fix:** Broken GODL URL removed. Replaced with instructions to search data.gov.in for the current GODL text. License claim preserved as GODL but marked as requiring URL verification. No stronger licensing claim made than the source supports.

---

### Fix 6 — UCI AI4I 2020: feature count and description corrected

**File:** `datasets/predictive-maintenance/uci-ai4i-2020.md`
**Issue (SIGNIFICANT):** Document described features in a way that did not clearly distinguish sensor measurements from metadata columns and target columns. Risk of 14 columns being misread as 14 sensor features.
**Fix:** Feature count corrected to 14 total columns broken down explicitly: 2 identifier columns (UDI, Product ID), 1 categorical column (Type), 5 continuous sensor measurements (Air temp, Process temp, Rotational speed, Torque, Tool wear), 1 composite failure label (Machine failure), and 5 binary failure mode targets (TWF, HDF, PWF, OSF, RNF). Classification header added (Type C — explicitly synthetic, as stated in the dataset's own paper).

---

### Fix 7 — NAB: record count corrected to verified value

**File:** `datasets/anomaly-detection/nab.md`
**Issue (SIGNIFICANT):** Record count was given as "approximately 365,000" (rounded, imprecise).
**Fix:** Corrected to 365,551 — the value cited in Lavin et al. (2015) and corroborated in published literature. Verification status noted. Classification header added (Type D — general ML benchmark, not wastewater-specific).

---

### Fix 8 — SWaT: record counts marked as literature-derived; data restriction reinforced

**File:** `datasets/anomaly-detection/swat.md`
**Issue (SIGNIFICANT):** Record counts (~496,800 normal, ~449,919 attack) were presented without qualification, but they were derived from published papers, not from direct inspection of the raw files (which require a signed data usage agreement to access).
**Fix:** Both counts marked explicitly as LITERATURE-DERIVED. Access restrictions section rewritten to make it unambiguous that raw SWaT files must not be committed to this repository under any circumstances. The signed data usage agreement process with SUTD iTrust is described step by step. Classification header added (Type B — real data, restricted access).

---

### Fix 9 — CPCB regulatory values: presented as universally applicable

**Files:** `references/regulations.md`, `models/water-quality.md`
**Issue (SIGNIFICANT):** CPCB Schedule VI values (BOD ≤ 30, COD ≤ 250, TSS ≤ 100) were presented in tables without adequate qualification. These are general reference values from Schedule VI; actual applicable limits depend on industry category, state, consent conditions, and the relevant regulatory notification.
**Fix (regulations.md):** General Standards section rewritten with an explicit multi-point qualification block explaining all factors that determine the applicable limit. Values retained as reference but clearly labeled as from public summaries, not directly verified from the current Official Gazette. COD ≤ 250 mg/L flagged as requiring manual verification.
**Fix (models/water-quality.md):** Target Variables table column renamed from "CPCB Standard" to "Reference value (CPCB Schedule VI — inland water)" with a Verification column added. Qualification caveat added below the table. Reference to `regulations.md` added.

---

### Fix 10 — PHM Society: specific challenge must be selected before use

**File:** `datasets/predictive-maintenance/phm-data-challenge.md`
**Issue (SIGNIFICANT):** Document was usable as a category-level reference but did not make it explicit enough that no generic "PHM dataset" exists — a specific challenge year with its own URL, license, and data type must be selected.
**Fix:** Classification header added (Type B/C — varies by year). Prominent note added at the top of the document stating this is a placeholder and that a specific challenge year must be selected and documented separately before this source can be used in SILVAPURE research.

---

## Items Requiring Manual Verification

These items could not be fully resolved during the audit because they require accessing a live source, a signed agreement, or a qualified professional review. They are documented here so they can be actioned by the appropriate person.

| # | Item | File | What Is Needed |
|---|---|---|---|
| V1 | UCI Water Treatment Plant license | `datasets/water-quality/uci-water-treatment-plant.md` | Visit current UCI ML Repository page and record the exact license terms stated |
| V2 | Kaggle Water Potability license (CC0) | `datasets/water-quality/uci-water-quality-prediction.md` | Confirm CC0 on the current Kaggle dataset page (`adityakadiwal/water-potability`) before treating as freely redistributable |
| V3 | Kaggle Water Quality (mssmartypants) license | `datasets/water-quality/kaggle-water-quality.md` | Check the current Kaggle dataset page (`mssmartypants/water-quality`) for the license statement |
| V4 | data.gov.in GODL license URL | `datasets/water-quality/data-gov-in-water-quality.md` | Find the current valid URL for the Government Open Data License India text on data.gov.in |
| V5 | NASA CMAPSS redistribution policy | `datasets/predictive-maintenance/nasa-cmapss.md` | Check current terms at `data.nasa.gov` — confirm whether redistribution of derived works is permitted |
| V6 | CPCB COD ≤ 250 mg/L value | `references/regulations.md`, `models/water-quality.md` | Verify COD limit from current Schedule VI text at `cpcb.nic.in/effluent-emission/` or from a qualified environmental engineer |
| V7 | SWaT record counts | `datasets/anomaly-detection/swat.md` | Verify ~496,800 normal and ~449,919 attack record counts against raw files once SUTD iTrust data usage agreement is obtained |
| V8 | PHM specific challenge selection | `datasets/predictive-maintenance/phm-data-challenge.md` | Select a specific challenge year (e.g. PHM 2021 bearing fault), read its terms, verify download URL, and create a separate dataset document replacing this placeholder |

---

## Datasets That Must NOT Be Committed to This Repository

| Dataset | Reason | Status |
|---|---|---|
| SWaT raw data files (any format) | SUTD iTrust data usage agreement explicitly prohibits redistribution to third parties. Committing to a repository constitutes redistribution. | Not committed — confirmed. Documentation file only. |
| PHM Society challenge files (most years) | Most PHM challenge datasets restrict access to registered participants and prohibit redistribution. Specific per-year terms must be verified before any files are committed. | Not committed — confirmed. Category placeholder only. |

**If SWaT or PHM files appear in `git status` at any point, remove them immediately before committing.**

---

## Datasets With Restricted Access (Access Required Before Use)

| Dataset | Access Method | URL |
|---|---|---|
| SWaT | Complete data request form, agree to SUTD iTrust terms | https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/ |
| PHM Society challenges | Register at phmsociety.org, read specific challenge terms | https://phmsociety.org/phm-society-conference/annual-conference/data-challenge/ |
| NASA CMAPSS | data.nasa.gov account (free registration) | https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data |
| data.gov.in CPCB | Free registration on data.gov.in | https://data.gov.in |

---

## Consistency Check Results

The following consistency checks were performed across all Markdown files after fixes were applied.

| Check | Result |
|---|---|
| URLs match the dataset being described | ✅ Pass — all URLs corrected and matched to correct datasets |
| Record counts consistent across files | ✅ Pass — NAB 365,551, SWaT LITERATURE-DERIVED, UCI WTP 527, AI4I 10,000, Kaggle Potability 3,276, mssmartypants 7,999 used consistently |
| Feature counts consistent | ✅ Pass — UCI AI4I 14 total / 5 sensor features used consistently |
| Licenses consistent | ✅ Pass — UCI AI4I CC BY 4.0 consistent; uncertain licenses flagged consistently |
| No duplicate or mislabelled datasets | ✅ Pass — Kaggle Potability and mssmartypants are now distinct documents |
| Restricted datasets not committed | ✅ Pass — SWaT and PHM documented as description-only; raw files not present |
| No unsupported claims | ✅ Pass — CPCB values qualified; SWaT counts marked LITERATURE-DERIVED; no model accuracy figures cited |
| No fabricated dataset information | ✅ Pass — UCI Water Quality doc rewritten to remove false UCI ID 374 |

---

## Files Modified During Audit

| File | Change |
|---|---|
| `datasets/water-quality/uci-water-treatment-plant.md` | URL corrected, classification header added |
| `datasets/water-quality/uci-water-quality-prediction.md` | Full rewrite — false UCI ID removed, rewritten as Kaggle Water Potability |
| `datasets/water-quality/kaggle-water-quality.md` | Full rewrite — corrected to mssmartypants dataset (7,999 records, 20 features) |
| `datasets/water-quality/data-gov-in-water-quality.md` | Broken GODL URL removed, replaced with search instructions |
| `datasets/predictive-maintenance/nasa-cmapss.md` | URL updated to data.nasa.gov, PCOE link removed, software/dataset distinction added |
| `datasets/predictive-maintenance/uci-ai4i-2020.md` | Feature count corrected (14 total / 5 sensor), classification header added |
| `datasets/predictive-maintenance/phm-data-challenge.md` | Classification header added, specific-challenge-required note added |
| `datasets/anomaly-detection/nab.md` | Record count corrected to 365,551 (verified), classification header added |
| `datasets/anomaly-detection/swat.md` | Record counts marked LITERATURE-DERIVED, access restriction section rewritten, classification header added |
| `references/regulations.md` | CPCB General Standards section rewritten with full qualification block |
| `models/water-quality.md` | Target Variable table column renamed and qualification caveat added |
| `DATASET-MATRIX.md` | Full rewrite with all corrected data, two distinct Kaggle rows, manual verification table, must-not-commit table |

---

## Recommended Next Steps

1. **Complete manual verification items V1–V8** listed above — assign to a team member with access to the relevant sources.
2. **Apply for SWaT dataset access** via SUTD iTrust before attempting to use SWaT for anomaly detection model research.
3. **Select a specific PHM challenge year** suitable for pump/motor predictive maintenance research and create a dedicated dataset document.
4. **Begin Phase 1 model research** using UCI Water Treatment Plant (water quality prediction) and UCI AI4I 2020 (predictive maintenance classification).
5. **Plan SILVAPURE telemetry collection** — see `data-requirements/SILVAPURE-telemetry-requirements.md` for the minimum data specification. At least 180 days of continuous data is needed before Phase 2 retraining.
6. **Re-run this audit** after manual verification items are completed to close the open items.
