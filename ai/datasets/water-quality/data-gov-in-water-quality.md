# data.gov.in Water Quality Resources

## Official Name
India Water Quality Data (multiple datasets available via data.gov.in open data portal)

## Official Source
Government of India Open Data Platform — data.gov.in
Key contributing agencies: Central Pollution Control Board (CPCB), National Water Mission, Ministry of Jal Shakti

## URL
https://data.gov.in/search?title=water+quality

Direct CPCB water quality search:
https://data.gov.in/search?title=water+quality&sector=Environment+and+Forest

## Dataset Type
Real (government monitoring data from Indian water bodies and treatment facilities)

## Domain
Indian surface water, groundwater, and ambient water quality monitoring. Some datasets cover river/lake monitoring stations; others cover drinking water and industrial discharge compliance records.

## Number of Records
Varies by specific dataset selected. Individual datasets on data.gov.in range from hundreds to tens of thousands of records. The CPCB river monitoring programme covers hundreds of monitoring stations.

## Features
Available features vary by dataset. Common parameters across CPCB-published datasets:
- pH
- Dissolved Oxygen (DO) in mg/L
- Biochemical Oxygen Demand (BOD) in mg/L
- Total Coliform (MPN/100mL)
- Conductivity (µS/cm)
- Turbidity (NTU) — in some datasets
- Nitrates, Phosphates — in some datasets
- Heavy metals (Arsenic, Lead, Chromium) — in industrial discharge datasets
- Temperature
- Station name, river/water body, state, year/month

## Target Variable
Depends on dataset and prediction task. Possible targets:
- Water Quality Index (WQI) classification
- Individual parameter compliance with CPCB standards
- Trend direction for seasonal monitoring

## Time-Series Characteristics
- Annual or quarterly reporting in many datasets
- Long historical series available for established monitoring stations (some span 1990s–present)
- Irregular temporal spacing common
- Station metadata includes geographic information

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | Partial | Ambient monitoring, not internal process data |
| Water Quality Prediction | Yes (India-relevant supplementary) | Most relevant for Indian regulatory context |
| Predictive Maintenance | No | No device data |
| Anomaly Detection | Yes (supplementary) | Seasonal anomaly patterns in Indian water bodies |

## Why It Is Useful
- **Most geographically and regulatorily relevant public dataset for SILVAPURE** (India-specific)
- Reflects CPCB standards directly applicable to SILVAPURE's target market
- Real Indian industrial and municipal treatment context
- Some datasets include industrial discharge compliance data

## What It Cannot Be Used For
- Real-time prediction modelling (annual/quarterly resolution in most datasets)
- Internal treatment plant process modelling (ambient monitoring data, not process data)
- Replacing SILVAPURE's own sensor telemetry

## Preprocessing Required
- Dataset-specific: download individual datasets from data.gov.in portal
- Standardise station/parameter naming (naming conventions vary across datasets)
- Handle missing values and "<LOQ" (below limit of quantification) entries
- Convert string-formatted values to numeric
- Verify units (some datasets mix mg/L and µg/L)
- Parse date formats (Indian government datasets use varied date formats)

## Feature Engineering Possibilities
- Indian WQI calculation (using NSF WQI or Indian BIS formula)
- Seasonal features (monsoon/post-monsoon/pre-monsoon indicators)
- Geographic region encoding
- Parameter exceedance flags against CPCB standards

## License
Government Open Data License — India (GODL)

**Note on license URL:** The previously documented URL `https://data.gov.in/government-open-data-license-india` returns a "Page Not Found" error as of the audit date. The GODL license text is notified via the Gazette of India. To read the current license text:
- Search "Government Open Data License India" on https://data.gov.in/
- Or refer to the OGD Platform India Terms of Use page

**Core terms (based on the GODL as publicly described):** Free to use, share, copy, publish, distribute, transmit, and adapt for any purpose including commercial, provided attribution is given to the Government of India and the relevant ministry/department. Individual datasets on data.gov.in may display dataset-specific licensing terms that override the default GODL — always check the individual dataset's license field on its data.gov.in page before redistribution.

**Do not make stronger licensing claims than the license text at source supports. Verify per dataset.**

## Redistribution Restrictions
Verify per dataset by checking the individual license field on its data.gov.in page. The default GODL permits redistribution with attribution. Some third-party contributed datasets may have different terms. The GODL URL has moved — verify the current full license text at data.gov.in before redistribution.

## Recommended Use
- Indian regulatory context validation
- Feature selection aligned with CPCB monitoring parameters
- Supplementary training data for Indian wastewater context
- Building reference distributions for Indian water quality parameters

## Citation
Central Pollution Control Board, Ministry of Environment, Forest and Climate Change, Government of India. Water Quality Data. Available at: https://data.gov.in

Specific dataset citations should reference the individual dataset DOI or URL from data.gov.in.

## Access Notes
Registration on data.gov.in is free. Most datasets are available as direct CSV/XLS downloads. API access is also available. Some industrial discharge datasets may require registration.
