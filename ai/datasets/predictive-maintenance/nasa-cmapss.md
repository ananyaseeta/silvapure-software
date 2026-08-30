# NASA CMAPSS Turbofan Engine Degradation Dataset

## Official Name
Commercial Modular Aero-Propulsion System Simulation (CMAPSS) — Turbofan Engine Degradation Simulation Dataset

## Official Source
NASA Ames Research Center — Prognostics Center of Excellence

## URL
https://data.nasa.gov/Aerospace/CMAPSS-Jet-Engine-Simulated-Data/ff5v-kuh6

Alternative / legacy access point (verify current availability):
https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/

## Dataset Type
Simulated (generated using a physical turbofan engine simulation model)

## Domain
Aerospace — turbofan jet engine degradation and Remaining Useful Life (RUL) estimation

**Important:** This dataset is from the aerospace domain. It has been widely adopted as a benchmark for RUL estimation in industrial settings. Its applicability to wastewater equipment is methodological (algorithm development), not domain-specific.

## Number of Records
Four sub-datasets (FD001–FD004):
- FD001: 20,631 training + 13,096 test cycles (1 operating condition, 1 fault mode)
- FD002: 53,759 training + 33,991 test cycles (6 operating conditions, 1 fault mode)
- FD003: 24,720 training + 16,596 test cycles (1 operating condition, 2 fault modes)
- FD004: 61,249 training + 41,214 test cycles (6 operating conditions, 2 fault modes)

(Record counts are approximate; verify at source)

## Features
- Engine unit ID
- Time-in-cycles (operational cycle counter — analogous to operational hours)
- 3 operational settings (continuous)
- 21 sensor measurements (continuous) — representing physical engine parameters (temperatures, pressures, fan speeds, etc.)
- Note: feature names in the original dataset are generic (sensor_1 through sensor_21)

## Target Variable
Remaining Useful Life (RUL) — number of cycles remaining until engine failure.
For training data, RUL is derived from the endpoint of each engine's trajectory.

## Time-Series Characteristics
- True multivariate time series per engine unit
- Each engine unit's trajectory ends at failure
- Sequential degradation pattern (monotonically decreasing RUL)
- Varying trajectory lengths across units
- This is the canonical dataset for RUL estimation research

## SILVAPURE Model Applicability
| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | Aerospace context, not process industry |
| Water Quality Prediction | No | No water quality data |
| Predictive Maintenance | Yes (methodology proxy) | Primary benchmark for RUL regression approaches |
| Anomaly Detection | Partial (methodology proxy) | Degradation onset detection |

## Why It Is Useful
- Gold standard benchmark for RUL estimation methodology
- Enables evaluation of LSTM, Temporal Fusion Transformer, and other sequence models before SILVAPURE data is available
- Multiple fault modes and operating conditions for robustness testing
- Well-studied — extensive published baselines available for comparison
- Validates that chosen sequence architectures can handle multi-sensor degradation trajectories

## What It Cannot Be Used For
- Direct modelling of wastewater equipment (completely different physics)
- Any production SILVAPURE maintenance predictions
- Wastewater pump degradation patterns (wastewater pumps degrade differently from jet engines)
- Transfer learning to SILVAPURE without significant domain adaptation

## Preprocessing Required
- Select relevant sub-dataset(s) (FD001 simplest, FD004 most complex)
- Normalise sensor readings per operating condition cluster (critical for FD002/FD004)
- Compute RUL labels for training set: max_cycle - current_cycle per unit
- Cap RUL at a maximum value (e.g., 125 cycles) — the "piece-wise RUL" approach common in literature
- Remove or mask sensors with near-zero variance (some sensors provide no information)
- Construct sliding window sequences for LSTM input

## Feature Engineering Possibilities
- Sensor signal smoothing (exponential moving average to reduce noise)
- Health index construction as weighted combination of selected sensors
- Normalised deviation from initial operating baseline per engine unit
- Principal component analysis for sensor dimensionality reduction

## License
NASA Open Data. NASA data is in the public domain under US law.

> NASA's open data policy: https://data.nasa.gov/stories/s/gk8h-th3y
> As of current knowledge, CMAPSS data is freely available. Verify current terms at data.nasa.gov before redistribution.

## Redistribution Restrictions
US federal government public domain data — generally freely redistributable. Verify current policy at data.nasa.gov, as data hosting and terms may have changed. Do not claim NASA endorsement.

## Recommended Use
- Algorithm development and benchmarking for Predictive Maintenance model
- RUL regression approach validation (LSTM, XGBoost, Random Forest)
- Sequence model architecture selection before SILVAPURE telemetry is available

## Citation
Saxena, A., Goebel, K., Simon, D., and Eklund, N. (2008). Damage Propagation Modeling for Aircraft Engine Run-to-Failure Simulation. In the Proceedings of the 1st International Conference on Prognostics and Health Management (PHM08), Denver CO, Oct 2008.

A. Saxena and K. Goebel (2008). "Turbofan Engine Degradation Simulation Data Set", NASA Ames Prognostics Data Repository. NASA Ames Research Center, Moffett Field, CA.
