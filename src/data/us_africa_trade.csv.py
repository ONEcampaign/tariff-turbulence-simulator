import sys
import json
import pandas as pd
from pathlib import Path
import country_converter as coco
from src.data.config import PATHS

RATE_SUFFIX_MAP = {0.00: "00", 0.10: "01", 0.25: "025", 0.50: "05"}

RATE_VALUE_MAP = {
    suffix: rate for rate, suffix in RATE_SUFFIX_MAP.items() if rate != 0.00
}


# === File I/O Utilities ===


def load_json(filepath: Path) -> dict:
    """Load a JSON file from a given path."""
    with open(filepath, "r") as f:
        return json.load(f)


def import_data() -> pd.DataFrame:
    """Import raw trade data CSV from predefined path."""
    return pd.read_csv(PATHS.IMPORTS_2024, skiprows=2)


# === Data Cleaning ===


def clean_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize and clean key columns in the import dataset."""
    column_dict = {
        "Country": "country",
        "Time": "year",
        "Commodity": "product_code",
        "Customs  Value (Cons) ($US)": "value",
    }

    df = df.rename(columns=column_dict)[column_dict.values()]
    df["product_code"] = df["product_code"].str.extract(r"^(\d{10})")
    df["value"] = pd.to_numeric(df["value"].str.replace(",", ""), errors="coerce")

    return df


def add_product_group_column(df: pd.DataFrame) -> pd.DataFrame:
    """Assign each product_code to a product group, dropping unmapped rows."""
    product_group_map = load_json(PATHS.HTS_GROUPS)

    prefix_to_group = {
        prefix: group
        for group, prefix_list in product_group_map.items()
        for prefix in prefix_list
    }

    def map_product_group(code):
        code_str = str(code).zfill(2)
        prefix = code_str[:2]
        return prefix_to_group.get(prefix)

    df = df.copy()
    df["product_group"] = df["product_code"].apply(map_product_group)
    return df[df["product_group"].notna()].reset_index(drop=True)


def normalize_country_names(df: pd.DataFrame) -> pd.DataFrame:
    cc = coco.CountryConverter()

    df["iso3"] = cc.pandas_convert(df["country"], to="ISO3")
    df["country"] = cc.pandas_convert(df["iso3"], src="ISO3", to="name_short")

    return df


# === Tariff Rate Assignment ===


def build_code_rate_map(json_paths: list[Path]) -> dict:
    """Build a map of product codes to tariff rates from multiple JSON files."""
    rate_map = {}
    for path in json_paths:
        data = load_json(path)
        rate = data["rate"]
        for code in data.get("codes", []):
            rate_map[code] = rate
        for code in data.get("exceptions", []):
            rate_map[code] = 0.0
    return rate_map


def assign_tariff_rate(
    df: pd.DataFrame, rate_map: dict, default_rate: float = 0.1
) -> pd.DataFrame:
    """Assign the applicable tariff rate to each row based on its product_code."""

    def lookup_rate(code):
        code_str = str(code)
        for length in range(len(code_str), 3, -1):
            prefix = code_str[:length]
            if prefix in rate_map:
                return rate_map[prefix]
        return default_rate

    df = df.copy()
    df["rate"] = df["product_code"].apply(lookup_rate)
    return df


def add_rate_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Add a column with tariff rates using predefined JSON rate files."""
    json_paths = [
        PATHS.ALUMINUM,
        PATHS.STEEL,
        PATHS.AUTOS,
        PATHS.EXEMPTIONS_1,
        PATHS.EXEMPTIONS_2,
    ]
    rate_map = build_code_rate_map(json_paths)
    return assign_tariff_rate(df, rate_map)


# === ETR Computation ===


def label_rate_column(df: pd.DataFrame, rate_col: str) -> pd.Series:
    """Generate a labeled value column (e.g., 'value_01') from a rate column."""
    labels = df[rate_col].map(RATE_SUFFIX_MAP).fillna("unknown")
    return "value_" + labels


def pivot_tariff_values(
    df: pd.DataFrame,
    idx_cols: list[str],
    value_col: str = "value",
    rate_col: str = "rate",
) -> pd.DataFrame:
    """Pivot value column into wide format based on tariff rate labels."""
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


def compute_total_imports(df: pd.DataFrame, idx_cols: list[str]) -> pd.DataFrame:
    """Compute total import values for a set of group columns."""
    totals = (
        df.groupby(idx_cols, observed=True, dropna=False)["value"].sum().reset_index()
    )
    return totals.rename(columns={"value": "total_imports"})


def compute_etr_column(df: pd.DataFrame) -> pd.Series:
    """Compute the effective tariff rate (ETR) from rate-labeled value columns."""
    etr_numerator = sum(
        df.get(f"value_{suffix}", 0) * rate for suffix, rate in RATE_VALUE_MAP.items()
    )
    return (etr_numerator / df["total_imports"]) * 100


def compute_etr(df: pd.DataFrame, group_cols: list[str]) -> pd.DataFrame:
    """Compute ETR by grouping over specified columns (e.g., country, product_group)."""
    df_by_rate = (
        df.groupby(group_cols + ["rate"], observed=True, dropna=False)["value"]
        .sum()
        .reset_index()
    )
    df_by_rate_wide = pivot_tariff_values(df_by_rate, idx_cols=group_cols)

    total_imports = compute_total_imports(df, group_cols)
    merged = df_by_rate_wide.merge(total_imports, on=group_cols, how="outer")
    merged["etr"] = compute_etr_column(merged)

    return merged[group_cols + ["total_imports", "etr"]]


def add_etr_column(df: pd.DataFrame) -> pd.DataFrame:
    """Compute ETR by country-product_group and by country only, then combine both."""
    etr_grouped = compute_etr(df, ["country", "product_group"])

    df_all = df.copy()
    df_all["product_group"] = "All products"
    etr_country = compute_etr(df_all, ["country", "product_group"])

    final_df = pd.concat([etr_grouped, etr_country], ignore_index=True)

    return (
        final_df.rename(columns={"total_imports": "value"})[
            ["country", "product_group", "value", "etr"]
        ]
        .sort_values(["country", "product_group"])
        .reset_index(drop=True)
    )


# === Pipeline ===


def read_format_df() -> pd.DataFrame:
    """Load, clean, annotate, and compute ETR on the raw import data."""
    raw_df = import_data()
    df = clean_columns(raw_df)
    df = add_product_group_column(df)
    df = add_rate_columns(df)
    df = add_etr_column(df)
    df = normalize_country_names(df)

    ordered_columns = ["country", "iso3", "product_group", "value", "etr"]

    return df[ordered_columns]


if __name__ == "__main__":
    df = read_format_df()
    df.to_csv(sys.stdout, index=False)
