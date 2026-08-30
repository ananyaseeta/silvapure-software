# data.gov.in CPCB Water Quality — Access Instructions

Raw data from data.gov.in is NOT pre-downloaded into this repository.

Reason: There is no single dataset file — data.gov.in hosts many individual datasets published by different agencies. The relevant CPCB datasets must be selected and downloaded individually based on the specific research need.

---

## Source

| Field | Value |
|---|---|
| Name | India Water Quality Data (various CPCB datasets) |
| Organization | Government of India / CPCB |
| URL | https://data.gov.in/search?title=water+quality |
| License | Government Open Data License India (GODL) — free use with attribution |
| SILVAPURE use | India-specific regulatory context and parameter distributions |

---

## How to download

1. Visit https://data.gov.in
2. Register for a free account (required for some datasets)
3. Search for: `water quality CPCB` or `river water quality`
4. Recommended datasets to look for:
   - "Water Quality of Rivers in India" (CPCB)
   - "Industrial Effluent Quality Data" (CPCB)
   - "Ground Water Quality" (CGWB)
5. Click the dataset, then "Download" (CSV or XLS)
6. Verify the license field shown on the dataset page
7. Place downloaded files at: `ai/datasets/water-quality/raw/`

---

## License note

The default license on data.gov.in is the Government Open Data License India (GODL), which permits free use, redistribution, and adaptation with attribution. However:
- The official GODL URL (`data.gov.in/government-open-data-license-india`) was returning 404 as of the 2026-07 audit
- Some datasets may have dataset-specific licenses that override GODL
- Always check the individual dataset's license field before redistribution

Verify current GODL text by searching "Government Open Data License" on https://data.gov.in before redistribution.

---

## Attribution
Central Pollution Control Board, Ministry of Environment, Forest and Climate Change, Government of India.
Water Quality Data. Available at: https://data.gov.in
