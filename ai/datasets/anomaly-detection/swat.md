# SWaT — Secure Water Treatment Dataset

## Official Name
SWaT (Secure Water Treatment) Dataset

## Official Source
iTrust, Centre for Research in Cyber Security, Singapore University of Technology and Design (SUTD)

## URL
https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/

## Dataset Type
Real (collected from an operational water treatment testbed — a scaled-down but functionally real water treatment plant)

## Domain
Water treatment — multi-stage process including ultrafiltration, reverse osmosis, dechlorination, UV sterilisation, and chemical dosing. The SWaT testbed is a real operational facility, not a simulation.

## Number of Records
- Normal operation: approximately 496,800 records (7 days of continuous operation at 1-second intervals)
- Attack scenarios: approximately 449,919 records (4 days including 36 attack scenarios)

## Features
51 sensor and actuator readings across 6 treatment stages:
- P1: Raw water supply (pumps, level sensors, flow meters)
- P2: Pre-treatment (chemical dosing, flow)
- P3: UF (ultrafiltration) backwash
- P4: De-chlorination (dosing, UV sensors)
- P5: RO (reverse osmosis) feed
- P6: Treated water supply

Features include: flow rates (FIT), pressure (PIT), level (LIT), turbidity (AIT), pH/chlorine (AIT), conductivity, pump on/off states (MV, P), valve states.

All readings are timestamped at 1-second intervals.

## Target Variable
Attack/Normal label (binary per timestamp):
- 0 = Normal operation
- 1 = Under attack (physical attack: valve manipulation, pump tampering, sensor spoofing, etc.)

For anomaly detection: the attack instances are the anomalies.

## Time-Series Characteristics
- 1-second resolution continuous time series
- True multivariate time series with strong inter-sensor correlations (plant physics)
- 36 distinct attack scenarios with varying duration and affected components
- Stable normal operation baseline allows distribution-based anomaly detection

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | Partial (proxy) | Multi-stage process health, but cyber-attack domain |
| Water Quality Prediction | Partial (proxy) | Some water quality sensors present, but focus is security |
| Predictive Maintenance | No | Not designed for equipment degradation |
| Anomaly Detection | Yes (primary proxy) | Most relevant public dataset for water treatment anomaly detection |

## Why It Is Useful
- **Best available public dataset for water treatment process anomaly detection**
- Real water treatment process physics (not simulated)
- Multi-stage process with realistic inter-sensor dependencies
- Benchmark used extensively in industrial ICS/SCADA security and process anomaly detection research
- High temporal resolution (1-second)
- Well-documented attack scenarios with ground truth labels

## What It Cannot Be Used For
- Cyber-security intrusion detection systems (not SILVAPURE's use case)
- Direct transfer to wastewater treatment (SWaT is clean water treatment)
- Equipment wear/degradation prediction (attacks, not degradation)
- Regulatory compliance modelling
- Any use that conflates sensor anomaly with physical process failure without careful analysis

## ACCESS RESTRICTIONS — CRITICAL

**This dataset CANNOT be downloaded without a formal data usage agreement.**

### Access Process:
1. Visit https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/
2. Complete the dataset request form
3. Provide: name, affiliation, intended use, institution
4. Agree to the SUTD iTrust data usage terms
5. Access is typically granted via a secure download link after review

### Restriction Summary:
- Academic and research use only (as of last verification)
- Cannot be redistributed to third parties
- Must acknowledge SUTD iTrust in publications
- Commercial use restrictions apply — verify current terms with iTrust

**DO NOT commit any SWaT dataset files to this repository.**
**DO NOT share dataset files outside your research team without iTrust approval.**

## Preprocessing Required (for when access is obtained)
- Remove first ~1,000 records (plant startup transient period)
- Verify timestamp continuity and handle any gaps
- Normalise continuous features using statistics computed on the normal-operation subset only (data leakage prevention)
- Separate normal and attack periods using the provided labels file
- Construct sliding windows for sequence-based anomaly detection

## Feature Engineering Possibilities
- Inter-sensor correlation features (physics-based constraints)
- Residuals between expected and actual sensor readings (process model residuals)
- Rolling statistics (mean, std, min, max) over 10s, 60s, 300s windows

## License
Academic research license — restricted
See: https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/

## Redistribution Restrictions
**Prohibited.** Dataset files may NOT be redistributed. Only this documentation may be committed to version control.

## Recommended Use
- Anomaly Detection model development (after obtaining access)
- Baseline evaluation of Isolation Forest, Autoencoder, and LSTM-based detection approaches
- Establishing anomaly detection evaluation protocols

## Status in This Repository
DOCUMENTATION ONLY — no dataset files committed or downloadable from this repository.

## Citation
Goh, J., Adepu, S., Junejo, K. N., & Mathur, A. (2016). A dataset to support research in the design of secure water treatment systems. In International Conference on Critical Information Infrastructures Security (pp. 88–99). Springer, Cham.

SUTD iTrust. SWaT Dataset. Singapore University of Technology and Design. https://itrust.sutd.edu.sg/
