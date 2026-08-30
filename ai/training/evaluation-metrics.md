# Evaluation Metrics

## Overview

This document defines the evaluation metrics for each SILVAPURE model. Metrics are chosen based on the problem type, the class distribution, and the operational consequences of different error types.

**No target threshold numbers are specified here for production models** because SILVAPURE does not yet have real data. Thresholds will be set during Phase 2 (pilot) based on operator and domain expert input.

---

## 1. Water Quality Prediction

**Task:** Multivariate time-series regression — predict effluent parameter values N hours ahead.

| Metric | Definition | Justification |
|---|---|---|
| RMSE | √(mean((ŷ - y)²)) per parameter | Penalises large errors more heavily; appropriate for effluent quality where large errors are disproportionately harmful |
| MAE | mean(\|ŷ - y\|) per parameter | Linear error measure; easier to interpret in parameter units |
| MAPE | mean(\|ŷ - y\| / y) × 100% | Percentage error; intuitive for operators. **Do not use when y ≈ 0** (BOD near 0 causes division issues) |
| R² | 1 - SS_res/SS_tot | Proportion of variance explained; useful for overall model fit assessment |
| Exceedance Detection Rate | TP / (TP + FN) where TP = predicted exceedance AND actual exceedance | Primary business metric: what fraction of real CPCB violations were predicted? |
| False Alarm Rate | FP / (FP + TN) | Operational cost metric: how often does the model predict violation when there is none? |

### Evaluation at Multiple Horizons
Compute all regression metrics separately at:
- 1-hour ahead
- 6-hour ahead
- 12-hour ahead
- 24-hour ahead

Performance at longer horizons is expected to degrade; this documents the reliable prediction window.

---

## 2. Plant Health Scoring

**Task:** Composite scoring (regression producing 0–100 score) and status classification (HEALTHY / MODERATE / CRITICAL).

### Regression Component
| Metric | Justification |
|---|---|
| MAE | Mean absolute error on the 0–100 score scale |
| RMSE | Emphasises large scoring errors |
| Pearson Correlation | Agreement between model score trend and operator assessment |

### Classification Component (HEALTHY / MODERATE / CRITICAL)
| Metric | Justification |
|---|---|
| Per-class Precision | Avoid false CRITICAL alerts (operational cost) |
| Per-class Recall | Avoid missing genuine CRITICAL status |
| Macro F1 | Balanced measure across all three classes |
| Confusion Matrix | Required for operator review; especially important for MODERATE vs CRITICAL boundary |

**Priority:** Recall for CRITICAL class > Precision for CRITICAL class. Missing a genuinely critical plant health event is more costly than a false alert.

---

## 3. Predictive Maintenance

**Task:** Binary failure classification (will device fail within N days?) and RUL regression.

### Classification Metrics
| Metric | Justification |
|---|---|
| AUPRC (Area Under Precision-Recall Curve) | Preferred for severely imbalanced classes (typical failure rate < 5%) |
| F1 at operating threshold | Single threshold summary |
| Precision at operating threshold | Cost of unnecessary maintenance |
| Recall at operating threshold | Cost of missed failures |
| ROC-AUC | Secondary reference only (misleading for imbalanced classes) |

**Threshold selection:** Choose the threshold that maximises F1 on the validation set. Document the precision-recall trade-off for each candidate threshold.

**Business metric:** Mean lead time (days) — the average number of days between the first failure prediction and the actual failure event. Computed during Phase 2 pilot with real data.

### RUL Regression Metrics
| Metric | Definition | Justification |
|---|---|---|
| MAE | Mean absolute error in RUL cycles/hours | Primary metric; interpretable in operational units |
| RMSE | Root mean squared error | Penalises large estimation errors |
| Score Function | A-score from CMAPSS literature: penalises late predictions more heavily than early predictions | Asymmetric cost structure: underestimating RUL (device fails before predicted) is more costly than overestimating |

The CMAPSS-derived score function:
```
s_i = exp(-d_i/13) - 1  if d_i < 0  (early prediction)
s_i = exp(d_i/10) - 1   if d_i ≥ 0  (late prediction)
Score = Σ s_i
```
where d_i = predicted_RUL - actual_RUL.

---

## 4. Anomaly Detection

**Task:** Binary classification of normal vs anomalous time points (or windows).

### When Labels Are Available (Phase 2 onwards)
| Metric | Justification |
|---|---|
| Precision at threshold | Proportion of flagged anomalies that are real — operational cost of false alarms |
| Recall at threshold | Proportion of real anomalies detected — safety cost of missed anomalies |
| F1 at operating threshold | Balanced measure |
| NAB Score (if using NAB benchmark) | Temporal tolerance scoring; rewards early detection and penalises late or missed detections |

**Priority:** Recall > Precision for safety-critical anomalies. False alarm rate must be kept below an operator-acceptable threshold to prevent alert fatigue.

### When No Labels Are Available (Phase 1 — unsupervised)
| Metric | Justification |
|---|---|
| Reconstruction error distribution | Visual inspection of score distribution for bimodal separation |
| Isolation Forest anomaly score distribution | Manual review of high-score events |
| Expert review rate | Percentage of flagged anomalies reviewed and confirmed by domain expert |

**Note:** Unsupervised anomaly detection metrics cannot be computed without labels. Phase 1 anomaly detection evaluation is qualitative. Phase 2 transitions to quantitative evaluation as operator labels accumulate.

---

## Cross-Model Common Principles

1. **No accuracy claims before Phase 2.** All Phase 1 metrics are relative benchmarks on proxy datasets only.

2. **Never report test-set metrics until the model is finalised.** Test sets are held out during hyperparameter tuning and threshold selection.

3. **Report metrics per class, not just macro-average.** Macro averages can hide poor performance on minority or critical classes.

4. **Report confidence intervals where possible.** Cross-validation standard deviations or bootstrap confidence intervals.

5. **Report the operating threshold explicitly.** A model with threshold 0.3 and threshold 0.7 are different models operationally.
