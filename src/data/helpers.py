"""Helper functions used across the data pipeline.

These utilities handle JSON loading, product sector mapping and
country filtering. They are imported by the loaders to prepare raw data
for Effective Tariff Rate calculations.
"""

import json
import pandas as pd

from pathlib import Path

from src.data.config import BASE_YEAR, PATHS


def load_json(filepath: Path) -> dict:
    """Load a JSON file from a given path."""
    with open(filepath, "r") as f:
        return json.load(f)


def add_sector_group_column(df: pd.DataFrame) -> pd.DataFrame:
    """Assign each product_code to a product group, dropping unmapped rows.

    The sector mapping is loaded from ``src/data/inputs/hs_groups.json`` and uses the first two digits of the HS code
    assigned to each traded product.
    """
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


def group_data(
    df: pd.DataFrame, group_cols: list[str], value_col: str = "value"
) -> pd.DataFrame:
    """Group a DataFrame by the given columns and sum the values."""
    grouped = (
        df.groupby(group_cols, observed=True, dropna=False)[value_col]
        .sum()
        .reset_index()
    )
    return grouped


def deflate_to_constant_usd(
    df: pd.DataFrame,
    id_column: str,
    value_column: str = "value",
    base_year: int = BASE_YEAR,
) -> pd.DataFrame:
    """Deflate a trade-value column from current to constant USD using IMF GDP deflators.

    Uses each country's own IMF GDP deflator (via pydeflate), matching the
    methodology in trade_data_explorer.  The DataFrame must contain a ``year``
    column alongside ``id_column`` and ``value_column``.

    Parameters
    ----------
    df:
        DataFrame with at least ``id_column``, ``year``, and ``value_column``.
    id_column:
        Column holding ISO3 country codes (e.g. ``"exporter_iso3_code"`` for
        BACI data, ``"iso3"`` for US Census Bureau data).
    value_column:
        Column holding the nominal trade value to deflate.  Defaults to
        ``"value"`` (BACI convention); pass ``"exports"`` for US Census data.
    base_year:
        Target constant-price year.  Defaults to ``BASE_YEAR`` (2024).

    Returns
    -------
    DataFrame with ``value_column`` replaced by constant-``base_year`` values
    in the same unit as the input.
    """
    from pydeflate import imf_gdp_deflate

    return imf_gdp_deflate(
        data=df,
        base_year=base_year,
        source_currency="USA",
        target_currency="USA",
        id_column=id_column,
        year_column="year",
        value_column=value_column,
        target_value_column=value_column,
        update_deflators=False,
    )


_cc = None


def _get_cc():
    global _cc
    if _cc is None:
        import country_converter as coco
        _cc = coco.CountryConverter()
    return _cc


def filter_african_countries(df: pd.DataFrame, iso_col: str) -> pd.DataFrame:
    """Filter a DataFrame to African countries based on an ISO column."""
    cc = _get_cc()
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
