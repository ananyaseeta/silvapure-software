# EPA Water Quality Portal — Access Instructions

Raw data from the EPA Water Quality Portal is NOT pre-downloaded into this repository.

Reason: The portal contains 400M+ records and there is no single canonical download file. Data must be queried by station, parameter, date range, and activity type. Committing a query export would be an arbitrary slice of a much larger dataset.

---

## Source

| Field | Value |
|---|---|
| Name | Water Quality Portal (WQP) |
| Organizations | US EPA, USGS, NWQMC |
| URL | https://www.waterqualitydata.us/ |
| License | US Federal Public Domain — freely redistributable |
| SILVAPURE use | Supplementary — water quality parameter distribution reference |

---

## How to query and download

### Option 1: Web interface
1. Visit https://www.waterqualitydata.us/
2. Under "Location" select Country = US; optionally filter by State
3. Under "Sampling" filter by:
   - Sample Media: Water
   - Characteristic Group: Nutrient, Physical, Organics, Inorganics
4. Set date range (e.g. last 5 years for recent data)
5. Click "Download" — choose CSV format
6. Place the downloaded file(s) at: `ai/datasets/water-quality/raw/`

### Option 2: REST API
```
https://www.waterqualitydata.us/data/Result/search?
  characteristicName=pH,Dissolved%20oxygen,Biochemical%20oxygen%20demand&
  sampleMedia=Water&
  startDateLo=01-01-2018&
  mimeType=csv
```
Full API documentation: https://www.waterqualitydata.us/webservices_documentation/

---

## Suggested query for SILVAPURE research

Parameters relevant to SILVAPURE water quality model:
- pH
- Dissolved oxygen (DO)
- Biochemical oxygen demand (BOD)
- Chemical oxygen demand (COD)
- Turbidity
- Total suspended solids (TSS)
- Conductivity

Filter for treatment plant effluent data:
- Activity Type: `Sample-Routine` or `Field Msr/Obs`
- Sample Media: `Water`
- Organization type: `Municipal` or `Industrial`

---

## Attribution
National Water Quality Monitoring Council (2023). Water Quality Portal.
https://doi.org/10.5066/P9QRKUVJ
