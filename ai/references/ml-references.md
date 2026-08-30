# ML Algorithm and Framework References

## Overview

This document lists the key algorithms and frameworks referenced in SILVAPURE model documentation, with authoritative citations and official repository links. No claims are made about performance on SILVAPURE tasks.

---

## Gradient Boosting Frameworks

### XGBoost
- **Full name:** eXtreme Gradient Boosting
- **Official repository:** https://github.com/dmlc/xgboost
- **Documentation:** https://xgboost.readthedocs.io/
- **Original paper:** Chen, T., & Guestrin, C. (2016). XGBoost: A Scalable Tree Boosting System. In Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (pp. 785–794). https://doi.org/10.1145/2939672.2939785

### LightGBM
- **Full name:** Light Gradient Boosting Machine
- **Official repository:** https://github.com/microsoft/LightGBM
- **Documentation:** https://lightgbm.readthedocs.io/
- **Original paper:** Ke, G., Meng, Q., Finley, T., Wang, T., Chen, W., Ma, W., ... & Liu, T. Y. (2017). LightGBM: A Highly Efficient Gradient Boosting Decision Tree. In Advances in Neural Information Processing Systems (NeurIPS) (pp. 3146–3154).

### CatBoost
- **Full name:** Categorical Gradient Boosting
- **Official repository:** https://github.com/catboost/catboost
- **Documentation:** https://catboost.ai/docs/
- **Original paper:** Prokhorenkova, L., Gusev, G., Veronika, A., Rakhlin, A., & Burtsev, A. (2018). CatBoost: Unbiased Boosting with Categorical Features. In Advances in Neural Information Processing Systems (NeurIPS).

---

## Random Forests

### Scikit-learn RandomForestClassifier / RandomForestRegressor
- **Official repository:** https://github.com/scikit-learn/scikit-learn
- **Documentation:** https://scikit-learn.org/stable/modules/ensemble.html#random-forests
- **Original paper:** Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5–32. https://doi.org/10.1023/A:1010933404324

---

## Anomaly Detection Algorithms

### Isolation Forest
- **Documentation:** https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html
- **Original paper:** Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). Isolation Forest. In 2008 Eighth IEEE International Conference on Data Mining (pp. 413–422). IEEE. https://doi.org/10.1109/ICDM.2008.17

### Local Outlier Factor (LOF)
- **Documentation:** https://scikit-learn.org/stable/modules/generated/sklearn.neighbors.LocalOutlierFactor.html
- **Original paper:** Breunig, M. M., Kriegel, H. P., Ng, R. T., & Sander, J. (2000). LOF: Identifying Density-Based Local Outliers. In Proceedings of the 2000 ACM SIGMOD International Conference on Management of Data (pp. 93–104).

---

## Sequence / Deep Learning Models

### LSTM (Long Short-Term Memory)
- **Original paper:** Hochreiter, S., & Schmidhuber, J. (1997). Long Short-Term Memory. Neural Computation, 9(8), 1735–1780. https://doi.org/10.1162/neco.1997.9.8.1735
- **PyTorch implementation:** https://pytorch.org/docs/stable/generated/torch.nn.LSTM.html
- **TensorFlow/Keras implementation:** https://www.tensorflow.org/api_docs/python/tf/keras/layers/LSTM

### Temporal Fusion Transformer (TFT)
- **Original paper:** Lim, B., Arık, S. Ö., Loeff, N., & Pfister, T. (2021). Temporal Fusion Transformers for Interpretable Multi-Horizon Time Series Forecasting. International Journal of Forecasting, 37(4), 1748–1764. https://doi.org/10.1016/j.ijforecast.2021.03.012
- **PyTorch Forecasting implementation:** https://pytorch-forecasting.readthedocs.io/en/stable/models/temporal_fusion_transformer.html
- **GitHub:** https://github.com/jdb78/pytorch-forecasting

---

## Survival Analysis

### lifelines (Python survival analysis library)
- **Documentation:** https://lifelines.readthedocs.io/
- **GitHub:** https://github.com/CamDavidsonPilon/lifelines
- **Relevant for:** Predictive Maintenance RUL estimation without requiring all units to fail

---

## Imbalanced Learning

### SMOTE (Synthetic Minority Over-sampling Technique)
- **imbalanced-learn library:** https://imbalanced-learn.org/
- **Original paper:** Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P. (2002). SMOTE: Synthetic Minority Over-sampling Technique. Journal of Artificial Intelligence Research, 16, 321–357.

---

## Key Python Libraries

| Library | Purpose | URL |
|---|---|---|
| scikit-learn | Preprocessing, classical ML, evaluation | https://scikit-learn.org |
| pandas | Tabular data manipulation | https://pandas.pydata.org |
| numpy | Numerical computing | https://numpy.org |
| PyTorch | Deep learning | https://pytorch.org |
| PyTorch Forecasting | TFT and other forecasting models | https://pytorch-forecasting.readthedocs.io |
| statsmodels | Statistical time-series models (SARIMA) | https://www.statsmodels.org |
| Optuna | Hyperparameter optimisation | https://optuna.org |
| MLflow | Experiment tracking | https://mlflow.org |
| imbalanced-learn | SMOTE and other imbalanced class tools | https://imbalanced-learn.org |
| lifelines | Survival analysis / time-to-event | https://lifelines.readthedocs.io |
