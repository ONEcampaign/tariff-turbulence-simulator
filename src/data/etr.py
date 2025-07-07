"""Utilities for computing effective tariff rates."""

from __future__ import annotations

import pandas as pd

RATE_SUFFIX_MAP = {0.00: "00", 0.10: "01", 0.25: "025", 0.50: "05"}
RATE_VALUE_MAP = {
    suffix: rate for rate, suffix in RATE_SUFFIX_MAP.items() if rate != 0.00
}


def label_rate_column(df: pd.DataFrame, rate_col: str) -> pd.Series:
    labels = df[rate_col].map(RATE_SUFFIX_MAP).fillna("unknown")
    return "value_" + labels


def pivot_tariff_values(
    df: pd.DataFrame,
    idx_cols: list[str],
    value_col: str = "exports",
    rate_col: str = "rate",
) -> pd.DataFrame:
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


def compute_total_exports(df: pd.DataFrame, idx_cols: list[str]) -> pd.DataFrame:
    totals = (
        df.groupby(idx_cols, observed=True, dropna=False)["exports"].sum().reset_index()
    )
    return totals.rename(columns={"exports": "total_exports"})


def compute_etr(df: pd.DataFrame) -> pd.Series:
    etr_numerator = sum(
        df.get(f"value_{suffix}", 0) * rate for suffix, rate in RATE_VALUE_MAP.items()
    )
    return etr_numerator / df["total_exports"]


def compute_etr_by_group(
    df: pd.DataFrame, group_cols: list[str] | None = None
) -> pd.DataFrame:
    if group_cols is None:
        group_cols = ["country", "sector"]
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
