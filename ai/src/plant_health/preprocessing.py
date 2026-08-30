"""
Plant Health Scoring — Preprocessing

Implements the preprocessing pipeline for the Plant Health Scoring model.
Follow the shared plan in preprocessing/preprocessing-plan.md.

This module is a placeholder. Implementation starts in Phase 1 (research).
"""


def load_uci_wtp(filepath: str):
    """Load UCI Water Treatment Plant dataset.

    Args:
        filepath: Path to water-treatment.data file.

    Returns:
        pandas DataFrame with missing values as NaN.

    Raises:
        FileNotFoundError: If the dataset file is not found.
            Download from https://archive.ics.uci.edu/dataset/207/water+treatment+plant
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def compute_component_scores(df):
    """Compute telemetry, alert, maintenance, and compliance component scores.

    See models/plant-health.md — Feature Engineering section.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def build_feature_matrix(df):
    """Build the full feature matrix including lag and rolling features."""
    raise NotImplementedError("Phase 1 implementation pending.")
