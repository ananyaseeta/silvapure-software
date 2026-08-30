# SWaT Dataset — Access Required

## Official Source

https://www.sutd.edu.sg/itrust/itrust-labs/datasets/dataset-characteristics/swat/

## Provider

iTrust, Singapore University of Technology and Design (SUTD)

## Purpose

Industrial water-treatment anomaly detection research. SWaT is a real operational water treatment testbed producing 1-second resolution multivariate sensor data with labelled physical attack scenarios, making it the most domain-relevant public anomaly detection benchmark for water treatment systems.

## Potential SILVAPURE Use

- Anomaly Detection model development and benchmarking
- Isolation Forest experimentation on multi-stage water treatment process data
- Industrial time-series anomaly research (multi-sensor correlation modelling)
- Benchmarking LSTM-based and autoencoder-based anomaly detectors against a real water treatment baseline

## Access

The SWaT dataset must be obtained directly from iTrust/SUTD through their official dataset request process:

1. Visit: https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/
2. Locate the SWaT dataset entry
3. Complete the dataset request form with:
   - Full name and institutional affiliation
   - Description of intended research use (describe SILVAPURE anomaly detection research context)
4. Agree to the SUTD iTrust data usage terms
5. iTrust will respond with a secure download link after reviewing the request

**Dataset request/access page:** https://itrust.sutd.edu.sg/itrust-labs_datasets/dataset_info/

## Redistribution

The raw SWaT dataset files **must NOT be redistributed through this GitHub repository** or any other channel without explicit written permission from SUTD iTrust.

The iTrust data usage agreement explicitly prohibits redistribution to third parties. Committing raw SWaT files to a repository (public or private) would constitute redistribution and a breach of that agreement.

## GitHub Contents

Only this access and documentation file is included in the repository. No raw SWaT dataset files are present or should be added.

If raw SWaT files are obtained via the iTrust access process, store them locally outside this repository (e.g. `~/datasets/swat/` or a secure research data server accessible to your team). Do not stage or commit them here.

## Dataset Description

| Field | Value |
|---|---|
| Full name | SWaT (Secure Water Treatment) Dataset |
| Testbed | Real operational water treatment testbed at SUTD |
| Normal operation data | ~496,800 records (7 days at 1-second intervals) — LITERATURE-DERIVED |
| Attack scenario data | ~449,919 records (4 days, 36 attack scenarios) — LITERATURE-DERIVED |
| Features | 51 sensor and actuator readings across 6 treatment stages |
| Labels | Binary attack/normal label per timestamp with ground truth |
| Resolution | 1 second |

Record counts are marked LITERATURE-DERIVED — derived from published academic papers, not verified against raw files.

## Citation

Goh, J., Adepu, S., Junejo, K. N., & Mathur, A. (2016). A dataset to support research in the design of secure water treatment systems. In International Conference on Critical Information Infrastructures Security (pp. 88–99). Springer, Cham.

SUTD iTrust. SWaT Dataset. Singapore University of Technology and Design.
https://itrust.sutd.edu.sg/
