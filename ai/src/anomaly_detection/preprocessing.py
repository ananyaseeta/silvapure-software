"""
Anomaly Detection — Preprocessing

Preprocessing for unsupervised and semi-supervised anomaly detection.

Proxy datasets:
  - UCI Water Treatment Plant (unlabelled, wastewater domain)
  - NAB (labelled anomaly windows, general time-series)
  - SWaT (labelled attacks, water treatment — RESTRICTED ACCESS)

See:
  datasets/anomaly-detection/uci-wastewater-anomaly.md
  datasets/anomaly-detection/nab.md
  datasets/anomaly-detection/swat.md
  preprocessing/preprocessing-plan.md

IMPORTANT: SWaT dataset requires a signed data usage agreement with SUTD iTrust.
Do NOT commit SWaT data files to this repository.
See datasets/anomaly-detection/swat.md for access instructions.

This module is a placeholder. Implementation starts in Phase 1 (research).
"""


def extract_normal_period(df, start_idx: int, end_idx: int):
    """Extract the normal-operation baseline period for anomaly detection training.

    Args:
        df: Full time-series DataFrame.
        start_idx: Start row index of the normal period.
        end_idx: End row index of the normal period.

    Returns:
        Subset DataFrame representing normal operation only.

    Note:
        For SWaT: use the first 6 days of the normal operation file.
        For UCI WTP: select a contiguous period with < 5% missing values.
        The selection must be documented and confirmed by a domain expert.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def build_multivariate_windows(df, window_size: int, stride: int = 1):
    """Build sliding window sequences for multivariate anomaly detection.

    Args:
        df: Preprocessed DataFrame with sensor readings.
        window_size: Number of timesteps per window.
        stride: Step size between windows.

    Returns:
        3D array of shape (n_windows, window_size, n_features).
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def compute_mahalanobis_features(df_train, df_eval):
    """Compute Mahalanobis distance from training-set centroid for each eval window.

    Args:
        df_train: Normal-period training data.
        df_eval: Evaluation data (may contain anomalies).

    Returns:
        Array of Mahalanobis distances.
    """
    raise NotImplementedError("Phase 1 implementation pending.")


def load_nab(data_dir: str, labels_filepath: str):
    """Load NAB dataset files and labels for evaluation.

    Args:
        data_dir: Directory containing NAB CSV data files.
        labels_filepath: Path to combined_labels.json or combined_windows.json.

    Returns:
        Dict of {filename: (DataFrame, anomaly_windows)}.

    Download NAB from: https://github.com/numenta/NAB
    """
    raise NotImplementedError("Phase 1 implementation pending.")
