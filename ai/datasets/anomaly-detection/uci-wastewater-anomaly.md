# UCI Water Treatment Plant Dataset (Anomaly Detection Use)

## Note
This document covers the same UCI Water Treatment Plant dataset described in `datasets/water-quality/uci-water-treatment-plant.md` but documents its specific applicability and usage pattern for anomaly detection tasks.

**Primary dataset documentation:** `datasets/water-quality/uci-water-treatment-plant.md`

---

## Anomaly Detection Relevance

### Official Name
Water Treatment Plant (water-treatment.data)

### Source
UCI Machine Learning Repository
https://archive.ics.uci.edu/dataset/207/water+treatment+plant

### Why This Dataset Appears in Anomaly Detection

The UCI Water Treatment Plant dataset was collected from a real municipal wastewater treatment plant. While no explicit anomaly or fault labels are provided, the dataset contains:

1. **Implicit anomalies via missing values**: Missing values (indicated by "?") cluster around periods of likely sensor failure or plant maintenance. These patterns can be used to develop missing-data-based anomaly indicators.

2. **Operational state transitions**: The multi-stage process data captures transitions between normal and non-normal operating states. Clustering approaches can identify unusual operating points.

3. **Statistical outliers in process parameters**: Extreme values in effluent quality parameters (DBO_E, SS_E) relative to inlet conditions may indicate process upsets or measurement errors.

### Dataset Type
Real (operational wastewater treatment plant data)

### Anomaly Detection Applicability
| Anomaly Type | Applicable | Approach |
|---|---|---|
| Sensor failure | Yes | Missing value pattern modelling |
| Process upset | Yes (implicit) | Statistical deviation from baseline distributions |
| Effluent exceedance | Yes (implicit) | Threshold violation detection |
| Data drift | Yes | Distribution shift over time |

## Limitations for Anomaly Detection

- **No explicit anomaly labels**: Anomaly detection must be unsupervised or use implicit indicators
- **Daily resolution**: Cannot detect sub-daily process upsets
- **527 records only**: Small dataset limits the statistical reliability of anomaly detection benchmarks
- **Unknown sensor calibration history**: Missing values may be legitimate anomalies or routine data collection gaps
- **No fault root cause information**: Cannot distinguish sensor failure from process failure

## Recommended Anomaly Detection Approaches for This Dataset

1. **Isolation Forest**: Applies well to multivariate, tabular, unlabelled data
2. **Autoencoder reconstruction error**: Train on a "normal" subset, detect high reconstruction error as anomaly
3. **DBSCAN / LOF (Local Outlier Factor)**: Density-based outlier identification
4. **Statistical process control (SPC)**: Control charts per parameter

## Preprocessing for Anomaly Detection Use

1. Impute or exclude missing values for the training (normal) reference distribution
2. Separate a validation period where known operational disturbances occurred (if available)
3. Normalise using statistics from the training period only (avoid data leakage)
4. Retain the missing value pattern as a separate binary feature (missing itself is informative)

## Relationship to SWaT Dataset

For pure anomaly detection research, **SWaT is preferred** over the UCI dataset because:
- SWaT has explicit anomaly labels
- SWaT has sub-second resolution
- SWaT is from a water treatment facility

However, UCI WTP is:
- Accessible without a data usage agreement
- Wastewater-specific (SWaT is clean water treatment)
- Provides a realistic unlabelled real-world anomaly detection scenario

## License
Same as primary documentation — UCI ML Repository terms.

## Citation
Same as primary documentation:
Bejar, J., Cortes, U., Poch, M. (1993). UCI Machine Learning Repository, Water Treatment Plant dataset.
