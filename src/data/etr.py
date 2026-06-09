"""Utilities for computing Effective Tariff Rates (ETR).

The functions here are used by the `ustrade` data loader to add an ETR column for each country-sector pair.
"""

import pandas as pd

def compute_etr_by_group(
    df: pd.DataFrame, group_cols: list[str] | None = None
) -> pd.DataFrame:
    """Returns a dataframe grouped by `country` or `sector` with an additional `etr` column.

    Parameters
    ----------
    df:
        DataFrame containing ``exports`` and ``rate`` columns.
    group_cols:
        Columns to group by. Defaults to ``["country", "sector"]``.
    """

    if group_cols is None:
        group_cols = ["country", "iso3", "sector"]

    # Aggregate exports by rate, country and sector
    # The resulting df has columns ["country", "sector", "rate" and "exports"]
    df_by_rate = (
        df.groupby(group_cols + ["rate"], observed=True, dropna=False)["exports"]
        .sum()
        .reset_index()
    )
    df_by_rate_wide = pivot_tariff_values(df_by_rate, idx_cols=group_cols)
    total_exports = compute_total_exports(df, group_cols)
    merged = df_by_rate_wide.merge(total_exports, on=group_cols, how="outer")
    merged["etr"] = compute_etr(merged)
    return merged[group_cols + ["total_exports", "etr"]]


def pivot_tariff_values(
    df: pd.DataFrame,
    idx_cols: list[str],
    value_col: str = "exports",
    rate_col: str = "rate",
) -> pd.DataFrame:
    """Pivot export values by tariff rate."""

    df = df.copy()
    df["rate_label"] = label_rate_column(df, rate_col)
    wide_df = df.pivot_table(
        index=idx_cols,
        columns="rate_label",
        values=value_col,
        aggfunc="sum",
        fill_value=0,
    ).reset_index()
    wide_df.columns.name = None
    return wide_df


def label_rate_column(df: pd.DataFrame, rate_col: str) -> pd.Series:
    """
    Return a label for each tariff rate in the form:
    - 0.0   -> 'value_00'
    - 0.25  -> 'value_025'
    """

    def format_rate(rate: float) -> str:
        if pd.isna(rate):
            return "unknown"
        rate_str = str(rate).replace(".", "")
        return f"value_{rate_str}"

    return df[rate_col].apply(format_rate)

def compute_total_exports(df: pd.DataFrame, idx_cols: list[str]) -> pd.DataFrame:
    """Aggregate exports across all rates across `country` or `sector`."""

    totals = (
        df.groupby(idx_cols, observed=True, dropna=False)["exports"].sum().reset_index()
    )
    return totals.rename(columns={"exports": "total_exports"})


def _rate_from_label(label: str) -> float:
    """Reconstruct the numeric rate from a column label produced by label_rate_column.

    Examples: 'value_00' -> 0.0, 'value_01' -> 0.1, 'value_025' -> 0.25, 'value_05' -> 0.5.
    Returns None for the 'value_unknown' sentinel (NaN rates).
    """
    suffix = label.replace("value_", "")
    if not suffix.isdigit():
        return None
    digits = suffix.lstrip("0") or "0"
    return float(digits) / (10 ** (len(suffix) - 1))


def compute_etr(df: pd.DataFrame) -> pd.Series:
    """
    Calculate the Effective Tariff Rate (ETR) for each row.

    Assumes df has:
    - 'country', 'sector', 'total_exports'
    - columns like 'value_00', 'value_01', 'value_025', etc.

    Returns a Series: etr_numerator / total_exports.
    Columns named 'value_unknown' (produced when rate is NaN) are skipped.
    """
    # Select only columns that match the 'value_' prefix and represent numeric rates
    value_cols = [col for col in df.columns if col.startswith("value_")]

    # Build the numerator dynamically; skip any 'value_unknown' columns
    etr_numerator = sum(
        df[col] * rate
        for col in value_cols
        if (rate := _rate_from_label(col)) is not None
    )

    return etr_numerator / df["total_exports"]
