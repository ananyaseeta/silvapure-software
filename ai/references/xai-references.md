# Explainability References (XAI)

## Overview

SILVAPURE's AI models are required to provide explanations for their predictions as part of the platform's AI guardrail and recommendation architecture. This document covers the XAI techniques referenced in the model specifications.

---

## SHAP (SHapley Additive exPlanations)

### Description
SHAP is a game-theoretic approach to explaining the output of any machine learning model. SHAP values assign each feature a contribution to the prediction for a specific instance, with the guarantee that contributions sum to the model output minus the expected model output.

### Official Resources
- **Repository:** https://github.com/slundberg/shap
- **Documentation:** https://shap.readthedocs.io/
- **PyPI:** `pip install shap`

### Original Paper
Lundberg, S. M., & Lee, S. I. (2017). A Unified Approach to Interpreting Model Predictions. In Advances in Neural Information Processing Systems (NeurIPS) (pp. 4765–4774).

Lundberg, S. M., Erion, G., Chen, H., DeGrave, A., Prutkin, J. M., Nair, B., ... & Lee, S. I. (2020). From Local Explanations to Global Understanding with Explainable AI for Trees. Nature Machine Intelligence, 2(1), 56–67. https://doi.org/10.1038/s42256-019-0138-9

### SILVAPURE Usage
| Model | SHAP Method | Purpose |
|---|---|---|
| Plant Health Scoring | TreeSHAP | Identify top drivers of low health scores |
| Water Quality Prediction | TreeSHAP or DeepExplainer | Feature importance for effluent parameter predictions |
| Predictive Maintenance | TreeSHAP | Explain which operational parameters contribute to failure risk |
| Anomaly Detection | TreeSHAP (Isolation Forest) | Identify which sensors contributed most to the anomaly score |

### Limitations
- TreeSHAP is exact for tree-based models and computationally efficient
- DeepExplainer and GradientExplainer for neural networks produce approximate explanations
- SHAP values explain individual predictions but do not directly provide actionable recommendations
- SHAP assumes feature independence in some formulations — this assumption may not hold for correlated water quality parameters

---

## LIME (Local Interpretable Model-Agnostic Explanations)

### Description
LIME generates local explanations for any classifier or regressor by fitting a simple interpretable model (linear regression, decision tree) to locally perturbed samples around the prediction instance.

### Official Resources
- **Repository:** https://github.com/marcotcr/lime
- **Documentation:** https://lime-ml.readthedocs.io/
- **PyPI:** `pip install lime`

### Original Paper
Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). "Why Should I Trust You?": Explaining the Predictions of Any Classifier. In Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (pp. 1135–1144). https://doi.org/10.1145/2939672.2939778

### SILVAPURE Usage
LIME is used as a model-agnostic secondary explanation method, particularly for:
- Neural network models where TreeSHAP is not applicable
- Validation of SHAP explanations
- Generating operator-readable text explanations for anomaly alerts

### Limitations
- Explanations are local approximations — may not reflect global model behaviour
- Choice of perturbation neighbourhood significantly affects results
- Computationally slower than SHAP for batch explanations
- Text-based tabular explanations may be ambiguous for time-series features

---

## AIExplainabilityMethod in SILVAPURE Schema

The SILVAPURE `AIModel` schema field `explainabilityMethod` maps to `AIExplainabilityMethod` enum:
- `NONE`: no explanation generated
- `SHAP`: TreeSHAP or DeepSHAP
- `LIME`: LIME local explanation

The `supportsExplainability` boolean on `AIModel` indicates whether the deployed model version provides per-prediction explanations.

**Requirement from SILVAPURE guardrail spec:** Any `AIRecommendation` generated with confidence score above the threshold must include an explanation. Recommendations flagged by guardrails as requiring human approval must include an explanation visible to the approving user.

---

## Additional XAI References

### Integrated Gradients
Sundararajan, M., Taly, A., & Yan, Q. (2017). Axiomatic Attribution for Deep Networks. In Proceedings of the 34th International Conference on Machine Learning (ICML) (pp. 3319–3328). http://proceedings.mlr.press/v70/sundararajan17a.html

Applicable to: LSTM and neural network water quality prediction models.

### Attention Mechanisms in TFT
Lim, B., Arık, S. Ö., Loeff, N., & Pfister, T. (2021). Temporal Fusion Transformers for Interpretable Multi-Horizon Time Series Forecasting. International Journal of Forecasting.

The TFT architecture produces interpretable attention weights across time steps and input features as part of its architecture. This provides built-in temporal explanations without requiring post-hoc SHAP calculation.

### ALIBI (Algorithmic Liability and Interpretability)
A Python library providing multiple explanation methods including:
- Contrastive Explanations Method (CEM)
- Counterfactual explanations
- Integrated Gradients

**Repository:** https://github.com/SeldonIO/alibi
**Documentation:** https://docs.seldon.io/projects/alibi/en/latest/

Relevant for generating counterfactual explanations ("What would need to change for the plant health score to increase?").
