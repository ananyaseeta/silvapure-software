"""
Plant Health Scoring — Training

Trains the Plant Health Scoring model using the preprocessed feature matrix.
See models/plant-health.md and training/training-strategy.md.

This module is a placeholder. Implementation starts in Phase 1 (research).
"""


def train_xgboost(X_train, y_train, params: dict):
    """Train XGBoost model for plant health classification.

    Args:
        X_train: Training feature matrix.
        y_train: Training labels (HEALTHY=2, MODERATE=1, CRITICAL=0).
        params: XGBoost hyperparameters.

    Returns:
        Trained XGBoost model.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def evaluate(model, X_test, y_test):
    """Evaluate model on held-out test set.

    Returns metrics dict per training/evaluation-metrics.md.
    """
    raise NotImplementedError("Phase 1 implementation pending.")
