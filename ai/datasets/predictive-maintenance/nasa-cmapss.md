# NASA CMAPSS Turbofan Engine Degradation Dataset

## Classification
**Type C — Simulated data (physics-based simulation)**

---

## Official Name
Commercial Modular Aero-Propulsion System Simulation (CMAPSS) — Turbofan Engine Degradation Simulation Dataset

**Important distinction:** There are two separate NASA CMAPSS-related items:
1. **This dataset (FD001–FD004 CSV files)** — simulated sensor data from a turbofan engine degradation model, used for RUL estimation research. This is the item documented here.
2. **C-MAPSS simulation software** — a separate software tool for generating custom turbofan simulations. As of the audit date, the software page at NASA carries a notice that it is **currently unavailable for download** pending review by Glenn Research Center management. **This does not affect the availability of the dataset CSV files.**

## Official Source
NASA Ames Research Center — Prognostics Center of Excellence (PCoE)

## Verified URL
**Current verified URL (HTTP 200):**
https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data

**Note on removed URLs:** The previous URL `https://data.nasa.gov/Aerospace/CMAPSS-Jet-Engine-Simulated-Data/ff5v-kuh6` returns HTTP 404. The legacy NASA PCOE repository at `ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/` no longer hosts dataset files and redirects to the generic NASA Ames ISD homepage. Both old URLs have been removed from this document.

**Access note:** The dataset page is on NASA's Open Data Portal. Availability should be confirmed at the current URL before starting any project phase that depends on it.

## Dataset Type
Simulated — generated using a physics-based turbofan engine simulation model. The data reflects the simulation's degradation physics, not real engine measurements. This is an explicitly stated characteristic of the dataset.

## Domain
Aerospace — turbofan jet engine degradation and Remaining Useful Life (RUL) estimation.

**This is an aerospace dataset.** Its application to SILVAPURE wastewater equipment is methodological only. Wastewater pumps, blowers, and filter presses degrade via fundamentally different physical mechanisms than jet engines.

## Number of Records
Four sub-datasets (FD001–FD004):
- FD001: approximately 20,631 training + 13,096 test cycles (1 operating condition, 1 fault mode)
- FD002: approximately 53,759 training + 33,991 test cycles (6 operating conditions, 1 fault mode)
- FD003: approximately 24,720 training + 16,596 test cycles (1 operating condition, 2 fault modes)
- FD004: approximately 61,249 training + 41,214 test cycles (6 operating conditions, 2 fault modes)

**Verification status:** These counts are from published literature. They should be confirmed by inspecting the downloaded files.

## Features
**26 columns total per row:**
- 1: Engine unit ID
- 2: Time-in-cycles (operational cycle counter)
- 3–5: 3 operational settings (continuous)
- 6–26: 21 sensor measurements (temperature, pressure, fan speed, etc.)

Feature names in the raw file are generic (no column headers). The mapping to physical quantities is documented in the associated publication (Saxena et al., 2008).

## Target Variable
**Remaining Useful Life (RUL)** — number of operational cycles remaining until engine failure.

For the training files: RUL must be computed as `max_cycle - current_cycle` per engine unit.
For the test files: true RUL values are provided in a separate `RUL_FD00X.txt` file.

## Time-Series Characteristics
- True multivariate time series — one trajectory per engine unit from healthy to failure
- Each engine unit's trajectory ends at failure (run-to-failure data)
- Varying trajectory lengths across engine units
- Monotonically decreasing RUL by design
- No calendar timestamps — cycle counter represents operational time

## SILVAPURE Model Applicability

| Model | Applicable | Notes |
|---|---|---|
| Plant Health Scoring | No | Aerospace context; no water quality or process features |
| Water Quality Prediction | No | No water quality data |
| Predictive Maintenance | Yes — methodology proxy | Primary benchmark for RUL regression algorithm development |
| Anomaly Detection | Partial — methodology only | Degradation onset can be framed as anomaly detection |

## Why It Is Useful
- The canonical benchmark for RUL estimation methodology in the prognostics literature
- Validates LSTM, TFT, and other sequence model architectures on multi-sensor degradation trajectories
- Multiple fault modes and operating conditions for robustness testing
- Extensive published baseline results available for algorithm comparison
- Demonstrates how run-to-failure data structures inform maintenance prediction

## Limitations and What It Cannot Be Used For
- **Aerospace physics, not wastewater equipment physics.** Wastewater pump and blower failure modes are driven by corrosion, fouling, bearing wear from abrasive particles, and chemical attack — not turbine blade degradation.
- **All failure events are present.** Real SILVAPURE data from plants with good preventive maintenance will have sparse failure events.
- **No timestamps.** Cannot simulate calendar-based maintenance scheduling.
- **Simulated data.** Real engine and equipment degradation will exhibit different variance and failure distributions.
- **Cannot be used for production SILVAPURE predictions without domain adaptation.**

## Preprocessing Required
1. Add column headers manually (from Saxena et al. 2008 documentation)
2. Identify and normalise by operating condition cluster (critical for FD002 and FD004)
3. Compute RUL labels for training: `max_cycle_per_unit - current_cycle`
4. Cap RUL at maximum value (125 cycles is standard in literature — "piecewise linear RUL")
5. Remove or mask sensors with near-zero variance across all units (some sensors provide no diagnostic information)
6. For LSTM: construct sliding windows of configurable length W

## Feature Engineering Possibilities
- Exponential moving average smoothing per sensor (reduces noise)
- Deviation from initial-cycle baseline per engine unit
- Statistical features: rolling mean, std, kurtosis over recent W cycles
- Health index construction as weighted linear combination of informative sensors
- Normalised deviation from unit's first-cycle baseline

## License
**US Federal Government Public Domain.** NASA data is produced by a federal agency and is in the public domain under US law (17 U.S.C. § 105).

**Verify current terms:** https://data.nasa.gov/stories/s/gk8h-th3y

NASA's open data policy permits free use and redistribution, but NASA endorsement must not be claimed.

## Redistribution Restrictions
Freely redistributable under US public domain. Do not claim NASA endorsement.

## Recommended Use
- RUL regression algorithm benchmarking for SILVAPURE Predictive Maintenance model (Phase 1)
- LSTM and TFT sequence model architecture validation
- Imbalanced learning approach development (note: this dataset is NOT imbalanced — all units run to failure)

## Citation
Saxena, A., Goebel, K., Simon, D., and Eklund, N. (2008). Damage Propagation Modeling for Aircraft Engine Run-to-Failure Simulation. In Proceedings of the 1st International Conference on Prognostics and Health Management (PHM08), Denver CO, Oct 2008.

A. Saxena and K. Goebel (2008). "Turbofan Engine Degradation Simulation Data Set," NASA Ames Prognostics Data Repository. NASA Ames Research Center, Moffett Field, CA.

Current dataset page: https://data.nasa.gov/dataset/cmapss-jet-engine-simulated-data
