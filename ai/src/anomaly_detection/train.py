"""
Anomaly Detection — Training

Trains unsupervised and semi-supervised anomaly detection models.
See models/anomaly-detection.md and training/training-strategy.md.

This module is a placeholder. Implementation starts in Phase 1 (research).
"""


def train_isolation_forest(X_normal, contamination: float = 0.05, params: dict = None):
    """Train Isolation Forest on normal-operation data.

    Args:
        X_normal: Feature matrix from the normal-operation baseline period only.
        contamination: Expected fraction of anomalies in future data (sets threshold).
        params: Additional IsolationForest hyperparameters.

    Returns:
        Trained IsolationForest model.

    WARNING: X_normal must contain ONLY confirmed normal-operation data.
             Training on data containing anomalies degrades sensitivity.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def train_autoencoder(X_normal_windows, params: dict = None):
    """Train LSTM Autoencoder on normal-operation windows.

    Args:
        X_normal_windows: 3D array of shape (n_windows, window_size, n_features).
        params: Autoencoder architecture and training hyperparameters.

    Returns:
        Trained PyTorch autoencoder model.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def compute_reconstruction_error(model, X_eval):
    """Compute per-window reconstruction error for anomaly scoring.

    Returns:
        Array of mean squared reconstruction errors.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def select_anomaly_threshold(scores_normal, target_fpr: float = 0.05):
    """Select anomaly score threshold to achieve a target false positive rate.

    Args:
        scores_normal: Anomaly scores from the held-out normal period.
        target_fpr: Acceptable false positive rate (default 5%).

    Returns:
        Float threshold value.
    """
    raise NotImplementedError("Phase 1 implementation pending.")
