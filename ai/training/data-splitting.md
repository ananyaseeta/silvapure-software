# Data Splitting Strategy

## The Core Rule

**For all time-series data: never use random shuffling.**

Random shuffling of time series creates data leakage because:
1. Future observations can appear in the training set
2. Autocorrelation means adjacent records contain similar information, inflating performance estimates
3. Seasonality patterns are broken, making validation unreliable

---

## Splitting Strategies by Task

### Strategy 1: Chronological Hold-Out Split

Used for: Initial development and fast iteration.

```
|<─────── Training (70%) ──────────>|<── Val (15%) ──>|<── Test (15%) ──>|
     oldest data                                            newest data
```

**Implementation:**
- Sort all data by timestamp ascending
- The last 15% of timesteps form the test set
- The 15% preceding the test set form the validation set
- Remaining 70% is training

**Limitations:** Single split is sensitive to the specific time period chosen. Periods with unusual conditions (seasonal extremes, equipment outages) in the test window can inflate or deflate metrics.

---

### Strategy 2: Walk-Forward Cross-Validation

Used for: Robust performance estimation. Preferred for model selection.

```
Fold 1: [──Train──][─Val─]
Fold 2: [────Train────][─Val─]
Fold 3: [──────Train──────][─Val─]
Fold 4: [────────Train────────][─Val─]
Fold 5: [──────────Train──────────][─Val─]
```

Each fold expands the training window; the validation window slides forward by a fixed period (e.g., 30 days). The test set is always held out from all folds.

**Parameters:**
- `initial_train_size`: minimum training window size (e.g., 180 days)
- `step_size`: how far the validation window moves per fold (e.g., 30 days)
- `forecast_horizon`: how far ahead predictions are made

**Advantages:**
- More reliable performance estimates than single split
- Captures model behaviour across different seasons and plant conditions

---

### Strategy 3: Multi-Entity Splitting

Used for: Fleet models (multiple plants or multiple devices).

Two sub-strategies:

#### 3A: Random Entity Hold-Out
Hold out one or more entities (plants/devices) entirely from training. All timesteps for held-out entities form the test set.

```
Plants: A, B, C, D, E
Train: A, B, C, D (all timesteps)
Test:  E (all timesteps)
```

**Tests:** Generalisation to new plants/devices not seen during training.

#### 3B: Per-Entity Chronological Split
For each entity, the most recent period is held out.

```
Plant A: [────Train────][─Test─]
Plant B: [────Train────][─Test─]
Plant C: [────Train────][─Test─]
```

**Tests:** Generalisation across time for each entity.

For SILVAPURE production models, **3B is preferred** because the operational goal is temporal prediction (future performance of known plants).

---

## Gap Period

When splitting time-series data, introduce a **gap period** between train and validation/test sets to account for:
- Autocorrelation leakage (adjacent timesteps carry similar information)
- The practical prediction lead time (e.g., a 24-hour prediction model should have a 24-hour gap)

**Recommended gap size:** Equal to the prediction horizon H. For a 24-hour ahead water quality model, insert a 24-hour gap between the training set end and the validation set start.

---

## Split Ratios by Phase

### Phase 1 (Proxy datasets — research)
- UCI WTP (527 daily records): 70% train (369 days) / 15% val (79 days) / 15% test (79 days)
- UCI AI4I (10,000 records): 70/15/15 chronological split
- NASA CMAPSS: use official train/test split provided by dataset + compute RUL labels per engine

### Phase 2 (Pilot — real SILVAPURE data)
- Minimum 90 days: 60/20/20 chronological split
- 180 days+: 70/15/15 with walk-forward validation
- 365 days+: 70/15/15 with walk-forward cross-validation

---

## What Must NEVER Enter the Training Set

1. Any data point with a timestamp after the training cutoff date
2. Any imputation value derived from post-training-cutoff observations
3. Any scaler, encoder, or statistics computed on validation or test data
4. Alert or maintenance labels derived from future observations
5. Any feature that requires knowledge of the full series (e.g., global z-score normalisation)

---

## Dataset-Specific Notes

### UCI Water Treatment Plant
- 527 daily records total
- Treat row order as day order (no timestamp column)
- Split: rows 1–369 train, 370–448 validation, 449–527 test

### NASA CMAPSS
- Split is provided by the dataset: separate train and test files per sub-dataset
- Do NOT re-split across the provided train/test boundary
- Within the training file: use the last 20% of engines (by unit ID) as a local validation set

### EPA Water Quality Portal
- Split by calendar date: train on data before a cutoff date
- Use 2–3 year hold-out to test seasonal generalisation

### SWaT
- Normal operation file: use first 6 days as training, day 7 as validation
- Attack operation file: use as the anomaly test set (do not include in training)
