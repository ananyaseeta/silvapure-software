# UCI Water Treatment Plant Dataset — Access Instructions

Raw data files are NOT included in this repository pending license confirmation.

---

## License Verification Required

This dataset was donated to UCI in 1993. The current redistribution license is not explicitly specified on the accessible UCI source. Before committing the raw files here, explicit confirmation must be obtained from UCI.

**Action:**
1. Email: ml-repository@ics.uci.edu
2. Reference: Dataset ID 207 — "Water Treatment Plant" (donated 1993, Bejar/Cortes/Poch)
3. Ask: Is this dataset covered under CC BY 4.0 or another explicit redistribution license that permits inclusion in a GitHub repository?
4. Update `uci-water-treatment-plant.md` with the confirmed license and add raw files to this directory

---

## Source

| Field | Value |
|---|---|
| Name | Water Treatment Plant (water-treatment.data) |
| Organization | UCI Machine Learning Repository, UC Irvine |
| Official URL | https://archive.ics.uci.edu/ml/datasets/Water |
| Contact | ml-repository@ics.uci.edu |
| Records | 527 daily observations |
| Features | 38 process measurements across 4 treatment stages |
| Missing values | ~15–30% indicated by `?` in the raw file |
| SILVAPURE use | Water Quality Prediction (primary proxy), Anomaly Detection |

---

## How to Download for Local Use (before license is confirmed)

While awaiting license confirmation, team members may download the dataset for local research use directly from UCI:

1. Visit: https://archive.ics.uci.edu/ml/datasets/Water
2. Download `water-treatment.data` and `water-treatment.names`
3. Store locally — do NOT commit to this repository yet
4. See `uci-water-treatment-plant.md` for preprocessing instructions

---

## Once License Is Confirmed

If UCI confirms a permissive license (e.g. CC BY 4.0):
1. Update the License and Redistribution sections in `uci-water-treatment-plant.md`
2. Add the raw files to `ai/datasets/water-quality/raw/`:
   - `water-treatment.data`
   - `water-treatment.names`
3. Commit with the UCI license confirmation reference

---

## Citation
Bejar, J., Cortes, U., Poch, M. (1993). LINNEO+: A Classification Methodology for Ill-Structured Domains.
UCI Repository: Dua, D. and Graff, C. (2019). UCI Machine Learning Repository. http://archive.ics.uci.edu/ml
