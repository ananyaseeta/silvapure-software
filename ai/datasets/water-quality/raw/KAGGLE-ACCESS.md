# Kaggle Water Quality Datasets — Access Instructions

Raw data files for the two Kaggle water quality datasets are NOT included in this repository.

Reason: Both datasets require a free Kaggle account to download, and their licenses are either unverified or not clearly stated. They must not be redistributed without verifying the specific license on each Kaggle dataset page.

---

## Dataset 1: Water Potability

| Field | Value |
|---|---|
| Name | Water Potability |
| Uploader | adityakadiwal |
| URL | https://www.kaggle.com/datasets/adityakadiwal/water-potability |
| Records | 3,276 |
| Features | 9 (pH, Hardness, Solids, Chloramines, Sulfate, Conductivity, Organic_carbon, Trihalomethanes, Turbidity) |
| Target | Potability (binary: 1 = potable, 0 = not potable) |
| License | Listed as CC0 on some versions — verify on current page before redistribution |
| SILVAPURE use | Feature reference only — not recommended for model training |

### Download steps
1. Create a free account at https://www.kaggle.com
2. Navigate to https://www.kaggle.com/datasets/adityakadiwal/water-potability
3. Click "Download" — file is `water-potability.csv`
4. Place downloaded file at: `ai/datasets/water-quality/raw/water-potability.csv`
5. Verify the license tab on the page before any redistribution

---

## Dataset 2: Water Quality (mssmartypants)

| Field | Value |
|---|---|
| Name | Water Quality |
| Uploader | mssmartypants |
| URL | https://www.kaggle.com/datasets/mssmartypants/water-quality |
| Records | 7,999 |
| Features | 20 physicochemical parameters |
| Target | is_safe (binary: 1 = safe, 0 = not safe) |
| License | Not clearly stated — check Kaggle page license tab |
| SILVAPURE use | Feature reference only — not recommended for model training |

### Download steps
1. Create a free account at https://www.kaggle.com
2. Navigate to https://www.kaggle.com/datasets/mssmartypants/water-quality
3. Click "Download" — file name varies; check downloaded archive
4. Place at: `ai/datasets/water-quality/raw/`
5. Verify the license tab on the page before any redistribution

---

## Why these are not committed

- Both datasets require a Kaggle account (not freely accessible via direct URL)
- License is unverified or unclear for redistribution purposes
- Neither dataset is recommended for SILVAPURE model training (unverified labels, drinking water context)
- See full documentation in `uci-water-quality-prediction.md` and `kaggle-water-quality.md`
