"""
Water Quality Prediction — Training

Trains the Water Quality Prediction model.
See models/water-quality.md and training/training-strategy.md.

This module is a placeholder. Implementation starts in Phase 1 (research).
"""


def train_xgboost_baseline(X_train, y_train, params: dict):
    """Train XGBoost tabular baseline with lag features.

    Args:
        X_train: Feature matrix including lag features.
        y_train: Target values (e.g., BOD_E, COD_E).
        params: XGBoost hyperparameters.

    Returns:
        Trained XGBoost model.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def train_lstm(X_train, y_train, params: dict):
    """Train LSTM sequence model for multi-step ahead prediction.

    Args:
        X_train: 3D array of shape (samples, window_size, features).
        y_train: 2D array of shape (samples, horizon).
        params: LSTM architecture and training hyperparameters.

    Returns:
        Trained PyTorch LSTM model.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def evaluate_horizons(model, X_test, y_test, horizons: list):
    """Evaluate model at each forecast horizon.

    Returns dict of metrics per horizon per target per evaluation-metrics.md.
    """
    raise NotImplementedError("Phase 1 implementation pending.")
