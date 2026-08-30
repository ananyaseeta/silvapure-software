# EPA Water Quality Portal

## Official Name
Water Quality Portal (WQP)

## Official Source
United States Environmental Protection Agency (EPA), US Geological Survey (USGS), and National Water Quality Monitoring Council (NWQMC) — jointly maintained

## URL
https://www.waterqualitydata.us/

## Dataset Type
Real — measurements collected from real water bodies and treatment facilities across the United States

## Domain
Surface water, groundwater, and treated water quality — United States

## Number of Records
Over 400 million water quality results as of recent publications (exact current count varies; query-specific exports range from thousands to millions of records depending on filters applied).

## Features
The WQP is a queryable portal. Available characteristics include (partial list):
- Physical parameters: temperature, pH, turbidity, conductivity, dissolved oxygen
- Chemical parameters: nitrate, phosphorus, ammonia, BOD, COD, TSS, TDS
- Heavy metals: arsenic, lead, mercury, cadmium, chromium
- Microbiological: E. coli, total coliform (where available)
- Metadata: station ID, activity date/time, sample medium, geographic coordinates, depth

Features available depend on query filters (state, activity type, characteristic group, date range).

## Target Variable
No fixed target. Use depends on the specific prediction task:
- Effluent compliance: individual parameter vs regulatory threshold
- Trend prediction: parameter value at time t+n given historical readings

## Time-Series Characteristics
- Date and time stamps available on most records
- Station-level longitudinal data available for long-running monitoring stations
- Irregular temporal spacing (sampling frequency varies by station and program)
- Multi-year historical data available for many stations

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | Partial (proxy) | Limited process-level detail |
| Water Quality Prediction | Yes (supplementary) | Real-world parameter distributions and co-variation |
| Predictive Maintenance | No | No device/sensor health data |
| Anomaly Detection | Yes (supplementary) | Historical anomaly events documented |

## Why It Is Useful
- One of the largest real-world water quality databases publicly available
- Geographic and temporal diversity reduces overfitting to a single plant
- Real-world parameter co-variation patterns
- Can provide realistic noise and missing data patterns
- Long historical records enable trend analysis

## What It Cannot Be Used For
- Direct modelling of Indian wastewater treatment plants (US data, US regulatory context)
- Process-level internal treatment plant measurements (mostly ambient/effluent monitoring)
- Real-time streaming simulation (portal provides batch exports only)
- Replacing SILVAPURE's own telemetry for production model training
- Mapping directly to CPCB India standards without parameter conversion

## Preprocessing Required
- API-based or bulk download query construction (see WQP REST API documentation)
- Handle irregular temporal spacing: resample or interpolate to consistent frequency
- Filter by relevant activity types (e.g., "Sample-Routine", "Field Msr/Obs")
- Normalise across different reporting units (EPA WQP results include unit field)
- Remove duplicate records (WQP aggregates from multiple databases)
- Station-level quality control flags should be respected

## Feature Engineering Possibilities
- Rolling statistics per station (7-day, 30-day windows)
- Seasonal decomposition (many parameters show strong seasonal variation)
- Spatial features if multi-station modelling
- Exceedance frequency features (how often a parameter exceeds a threshold)

## License
US Federal Government public domain. Data from WQP is in the public domain and may be redistributed freely. Always verify with https://www.waterqualitydata.us/faqs/ for specific terms.

## Redistribution Restrictions
No redistribution restriction for US federal data. Third-party contributed data within WQP may have different terms — check the `OrganizationIdentifier` field in exports.

## Recommended Use
- Supplementary training data for water quality parameter range validation
- Pre-training data source where SILVAPURE-specific data is unavailable
- Establishing realistic parameter distribution priors
- Anomaly detection threshold calibration

## Citation
National Water Quality Monitoring Council (2023). Water Quality Portal. https://doi.org/10.5066/P9QRKUVJ

For USGS data within WQP:
U.S. Geological Survey, 2016, National Water Information System data available on the World Wide Web (USGS Water Data for the Nation), accessed at URL http://waterdata.usgs.gov/nwis/.
