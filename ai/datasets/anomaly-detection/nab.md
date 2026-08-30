# NAB — Numenta Anomaly Benchmark

## Official Name
NAB (Numenta Anomaly Benchmark)

## Official Source
Numenta, Inc.

## URL
https://github.com/numenta/NAB

## Dataset Type
Mix — real and simulated time-series data:
- Real: server/infrastructure metrics, Twitter mentions, ambient temperature, NYC taxi demand
- Artificial/simulated: synthetic anomaly injection patterns

## Domain
General-purpose time-series anomaly detection benchmark. Domains covered include:
- IT/infrastructure metrics (CPU, memory, network traffic)
- Ambient temperature sensors
- Traffic volume
- Artificial time series with injected anomalies

**Important:** NAB does NOT contain water treatment or wastewater-specific data.

## Number of Records
58 data files (time series). Individual files range from a few hundred to several thousand data points. Total: approximately 365,000 data points across all files.

## Features
Each NAB file has a simple structure:
- `timestamp`: ISO format timestamp
- `value`: single numeric value (the measured metric)
- `label` (in the labels file): 0 = normal, 1 = anomaly window

It is a univariate time series benchmark (one value per timestamp per file).

## Target Variable
Anomaly label (binary): whether a time point falls within an anomaly window.

Labels are provided in a separate JSON labels file. Anomaly windows rather than point labels are used.

## Time-Series Characteristics
- Temporal resolution varies by data file (from seconds to hours)
- Continuous time series with seasonal patterns in many files
- Anomalies are labelled as windows (not precise point labels) due to temporal ambiguity
- Contains both sudden (point) and gradual (contextual) anomalies

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | No process data, no water quality data |
| Water Quality Prediction | No | No water quality parameters |
| Predictive Maintenance | Partial (methodology) | Infrastructure metric patterns loosely analogous to sensor streams |
| Anomaly Detection | Yes (methodology proxy) | Algorithm benchmarking on real-world temporal anomalies |

## Why It Is Useful
- Provides a rigorous scoring mechanism (the "NAB score") for anomaly detector evaluation with temporal tolerance
- Covers multiple anomaly types: point anomalies, contextual anomalies, collective anomalies
- Well-established benchmark — hundreds of published comparisons available
- Useful for calibrating threshold selection and tolerance window approaches before applying to SILVAPURE sensor data

## What It Cannot Be Used For
- Water quality or wastewater treatment prediction
- Domain-specific feature engineering for SILVAPURE
- Any claim that an algorithm performs well on water treatment anomalies because it performs well on NAB
- Production anomaly detection without domain adaptation

## Preprocessing Required
- Select relevant files (machine data files most analogous to sensor streams)
- Parse ISO timestamps
- Apply the NAB scoring methodology (requires the NAB evaluation scripts from the GitHub repository)
- Construct sliding window features if using supervised approaches

## Feature Engineering Possibilities
- Univariate only in original format — enrich by computing rolling statistics
- Seasonality decomposition (relevant for temperature/traffic files)

## License
Numenta Open Data License (NODL) — as of this document, the NAB data and code are available at:
https://github.com/numenta/NAB/blob/master/LICENSE.txt

**Verify current license terms at the GitHub repository.** The NODL generally permits research use with attribution. Some files within NAB have separate original sources — check the data/README.md in the NAB repository for per-file licensing.

## Redistribution Restrictions
Verify per file. Most files are freely redistributable under the NODL with attribution. Some third-party files may have additional terms.

## Recommended Use
- Evaluating and selecting anomaly detection algorithms
- Calibrating NAB-score-based evaluation methodology
- Developing temporal tolerance-based evaluation scripts applicable to SILVAPURE sensor streams

## Citation
Lavin, A., Ahmad, S. (2015). Evaluating Real-time Anomaly Detection Algorithms — the Numenta Anomaly Benchmark. In 2015 IEEE 14th International Conference on Machine Learning and Applications (ICMLA) (pp. 38–44). IEEE.

Repository: https://github.com/numenta/NAB
