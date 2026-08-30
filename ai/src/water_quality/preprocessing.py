"""
Water Quality Prediction — Preprocessing

Implements the preprocessing pipeline for the Water Quality Prediction model.
Follow the shared plan in preprocessing/preprocessing-plan.md.

Primary proxy dataset: UCI Water Treatment Plant
See: datasets/water-quality/uci-water-treatment-plant.md

This module is a placeholder. Implementation starts in Phase 1 (research).
"""


def load_uci_wtp(filepath: str):
    """Load UCI Water Treatment Plant dataset.

    Args:
        filepath: Path to water-treatment.data file.

    Returns:
        pandas DataFrame with missing values as NaN and temporal ordering preserved.

    Raises:
        FileNotFoundError: If the dataset file is not found.
            Download from https://archive.ics.uci.edu/dataset/207/water+treatment+plant
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def build_lag_features(df, lags: list, features: list):
    """Add lag features to DataFrame for tabular time-series modelling.

    Args:
        df: Input DataFrame sorted by time.
        lags: List of lag depths, e.g. [1, 3, 6, 12, 24].
        features: List of feature column names to lag.

    Returns:
        DataFrame with lag columns appended.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def build_sliding_windows(df, window_size: int, horizon: int, features: list, targets: list):
    """Construct sliding window sequences for LSTM/TFT input.

    Args:
        df: Input DataFrame sorted by time.
        window_size: Length of historical context window.
        horizon: Number of steps ahead to predict.
        features: Input feature columns.
        targets: Target column names.

    Returns:
        Tuple of (X, y) arrays shaped for sequence models.
    """
    raise NotImplementedError("Phase 1 implementation pending.")
