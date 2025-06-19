import sys
import json
import pandas as pd
from pathlib import Path

from bblocks import places
from bblocks.data_importers import WEO

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
    return pd.read_csv(PATHS.EXPORTS_2024)


# === Data Cleaning ===


def clean_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Standardize and clean key columns in the import dataset."""
    column_dict = {
        "Country": "country",
        "Time": "year",
        "Commodity": "product_code",
        "Customs  Value (Cons) ($US)": "exports",
    }

    df = df.rename(columns=column_dict)[column_dict.values()]
    df["product_code"] = df["product_code"].str.extract(r"^(\d{10})")
    df["exports"] = pd.to_numeric(df["exports"].str.replace(",", ""), errors="coerce")

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
    df["product"] = df["product_code"].apply(map_product_group)
    return df[df["product"].notna()].reset_index(drop=True)


def normalize_country_names(df: pd.DataFrame) -> pd.DataFrame:

    df["iso3"] = places.resolve_places(df["country"], to_type="iso3_code", not_found="ALL")
    df.loc[df["iso3"].isna(), "iso3"] = "ALL"
    df["country"] = places.resolve_places(df["iso3"], to_type="name_short", not_found="All countries")
    df.loc[df["country"].isna(), "country"] = "All countries"

    return df


# === GDP Data ===

def get_africa_gdp_data() -> pd.DataFrame:
    """Retrieve GDP data from African countries"""

    weo = WEO()
    data = weo.get_data()

    gdp_df = data.query("`indicator_code` == 'NGDPD' and `year` == 2024")
    gdp_df.loc[:, "gdp"] = gdp_df["value"] * gdp_df["scale_code"]
    gdp_df.loc[:, "region"] = places.resolve_places(gdp_df["entity_name"], to_type="region", not_found="ignore")
    gdp_df = gdp_df.query("`region` == 'Africa'")
    gdp_df.loc[:, "iso3"] = places.resolve_places(gdp_df["entity_name"], to_type="iso3_code", not_found="ignore")

    return gdp_df[["iso3", "gdp"]]


def assert_iso3_code_alignment(df1: pd.DataFrame, df2: pd.DataFrame) -> bool:
    """
    Check whether two DataFrames have the same set of ISO3 country codes (excluding "ALL").
    """
    set1 = set(df1["iso3"].unique()) - {"ALL"}
    set2 = set(df2["iso3"].unique()) - {"ALL"}

    if set1 == set2:
        return True
    else:
        only_in_df1 = set1 - set2
        only_in_df2 = set2 - set1
        raise ValueError(
            f"ISO3 code mismatch:\n"
            f"Only in df1: {sorted(only_in_df1)}\n"
            f"Only in df2: {sorted(only_in_df2)}"
        )


def add_gdp_column(df: pd.DataFrame) -> pd.DataFrame:
    """Adds a GDP column to the dataframe."""

    gdp_df = get_africa_gdp_data()

    if assert_iso3_code_alignment(df, gdp_df):

        gdp_df_all = pd.DataFrame(
            {
                "iso3": ["ALL"],
                "gdp": [gdp_df["gdp"].sum()]
            },
        )
        gdp_df_complete = pd.concat([gdp_df, gdp_df_all], ignore_index=True)

        return pd.merge(df, gdp_df_complete, on="iso3", how="left")


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
    value_col: str = "exports",
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
        df.groupby(idx_cols, observed=True, dropna=False)["exports"].sum().reset_index()
    )
    return totals.rename(columns={"exports": "total_imports"})


def compute_etr(df: pd.DataFrame) -> pd.Series:
    """Compute the effective tariff rate (ETR) from rate-labeled value columns."""
    etr_numerator = sum(
        df.get(f"value_{suffix}", 0) * rate for suffix, rate in RATE_VALUE_MAP.items()
    )
    return round((etr_numerator / df["total_imports"]) * 100)


def compute_etr_by_group(df: pd.DataFrame, group_cols: list[str] = ["country", "product"]) -> pd.DataFrame:
    """Compute ETR by grouping over specified columns (e.g., country, product_group)."""
    df_by_rate = (
        df.groupby(group_cols + ["rate"], observed=True, dropna=False)["exports"]
        .sum()
        .reset_index()
    )
    df_by_rate_wide = pivot_tariff_values(df_by_rate, idx_cols=group_cols)

    total_imports = compute_total_imports(df, group_cols)
    merged = df_by_rate_wide.merge(total_imports, on=group_cols, how="outer")
    merged["etr"] = compute_etr(merged)

    return merged[group_cols + ["total_imports", "etr"]]


def add_etr_column(df: pd.DataFrame) -> pd.DataFrame:
    variants = [
        {},
        {"product": "All products"},
        {"country": "All countries"},
        {"country": "All countries", "product": "All products"},
    ]

    frames = []
    for overrides in variants:
        df_variant = df.assign(**overrides)
        frames.append(compute_etr_by_group(df_variant))

    final_df = (
        pd.concat(frames, ignore_index=True)
        .rename(columns={"total_imports": "exports"})
        .loc[:, ["country", "product", "exports", "etr"]]
        .sort_values(["country", "product"])
        .reset_index(drop=True)
    )
    return final_df


# === Pipeline ===


def read_format_df() -> pd.DataFrame:
    """Load, clean, annotate, and compute ETR on the raw import data."""
    raw_df = import_data()
    df = clean_columns(raw_df)
    df = add_product_group_column(df)
    df = add_rate_columns(df)
    df = add_etr_column(df)
    df = normalize_country_names(df)
    df = add_gdp_column(df)

    ordered_columns = ["country", "iso3", "product", "exports", "etr", "gdp"]

    return df[ordered_columns]


if __name__ == "__main__":
    df = read_format_df()
    df.to_csv(sys.stdout, index=False)
