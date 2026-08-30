"""
Predictive Maintenance — Preprocessing

Implements preprocessing for both:
  - Failure classification: UCI AI4I 2020 proxy dataset
  - RUL regression: NASA CMAPSS proxy dataset

See:
  datasets/predictive-maintenance/uci-ai4i-2020.md
  datasets/predictive-maintenance/nasa-cmapss.md
  preprocessing/preprocessing-plan.md

This module is a placeholder. Implementation starts in Phase 1 (research).
"""


def load_ai4i(filepath: str):
    """Load UCI AI4I 2020 Predictive Maintenance Dataset.

    Args:
        filepath: Path to ai4i2020.csv.

    Returns:
        pandas DataFrame.

    Raises:
        FileNotFoundError: If the dataset file is not found.
            Download from https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def load_cmapss(train_filepath: str, test_filepath: str, rul_filepath: str):
    """Load NASA CMAPSS train/test/RUL files.

    Args:
        train_filepath: Path to train_FD00X.txt
        test_filepath: Path to test_FD00X.txt
        rul_filepath: Path to RUL_FD00X.txt

    Returns:
        Tuple of (train_df, test_df) with RUL labels added.

    Raises:
        FileNotFoundError: If dataset files are not found.
            Download from https://data.nasa.gov/Aerospace/CMAPSS-Jet-Engine-Simulated-Data/ff5v-kuh6
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def compute_rul_labels(df, max_rul: int = 125):
    """Compute Remaining Useful Life labels using piecewise linear approach.

    Args:
        df: DataFrame with 'unit_id' and 'cycle' columns.
        max_rul: Cap on maximum RUL value (standard = 125 for CMAPSS).

    Returns:
        DataFrame with 'rul' column added.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def handle_class_imbalance(X_train, y_train, strategy: str = "smote"):
    """Handle binary failure class imbalance.

    Args:
        X_train: Training features.
        y_train: Binary failure labels.
        strategy: 'smote', 'class_weight', or 'threshold_tuning'.

    Returns:
        Resampled (X_train, y_train) or class_weight dict.
    """
    raise NotImplementedError("Phase 1 implementation pending.")
