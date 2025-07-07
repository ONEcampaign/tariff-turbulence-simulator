import json
import pandas as pd

from pathlib import Path

from src.data.config import PATHS


def load_json(filepath: Path) -> dict:
    """Load a JSON file from a given path."""
    with open(filepath, "r") as f:
        return json.load(f)


def add_sector_group_column(df: pd.DataFrame) -> pd.DataFrame:
    """Assign each product_code to a product group, dropping unmapped rows."""
    sector_group_map = load_json(PATHS.HS_GROUPS)

    prefix_to_group = {
        prefix: group
        for group, prefix_list in sector_group_map.items()
        for prefix in prefix_list
    }

    def map_sector_group(code):
        code_str = str(code).zfill(2)
        prefix = code_str[:2]
        return prefix_to_group.get(prefix)

    df = df.copy()
    df["sector"] = df["product_code"].apply(map_sector_group)
    return df[df["sector"].notna()].reset_index(drop=True)


def group_data(df: pd.DataFrame, group_cols: list[str], value_col: str = "value") -> pd.DataFrame:
    """Group a DataFrame by the given columns and sum the values."""
    grouped = (
        df.groupby(group_cols, observed=True, dropna=False)[value_col]
        .sum()
        .reset_index()
    )
    return grouped


def filter_african_countries(df: pd.DataFrame, iso_col: str) -> pd.DataFrame:
    """Filter a DataFrame to African countries based on an ISO column."""
    import country_converter as coco

    cc = coco.CountryConverter()
    df = df.copy()
    df["region"] = cc.pandas_convert(df[iso_col], to="continent")
    df = df.query("region == 'Africa'")
    df["country"] = cc.pandas_convert(df[iso_col], to="name_short")
    territories = [
        "French Southern Territories",
        "British Indian Ocean Territory",
        "Mayotte",
        "St. Helena",
    ]
    return df.query("country not in @territories")
