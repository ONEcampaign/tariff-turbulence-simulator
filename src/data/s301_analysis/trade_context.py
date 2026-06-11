"""Context table for the 7 S301-targeted African economies (BACI, 2022-2024).

Produces one row per country with average annual figures for 2022-2024:

  Country                   display name
  Exports to US             avg annual exports to the US (const. 2024 USD bn)
  US Export Share (%)       share of total exports destined for the US
  Trade Position (vs US)    net trade position — "Net exporter" or "Net importer"
  Top US Export {1-3}       HS chapter code + description for the 3 largest US-export categories
  Export Value {1-3}        corresponding average annual export value (const. 2024 USD bn)

BACI source values are in current USD thousands (CEPII convention). They are
deflated to constant 2024 USD using each country's IMF GDP deflator (via
pydeflate), matching the methodology in trade_data_explorer. Deflation is
applied only to the relevant subset of BACI (the 7 target exporters plus US
bilateral flows), then values are converted to billions.

Run via:  python -m src.data.s301_analysis.trade_context
"""

from __future__ import annotations

import pandas as pd
from bblocks.data_importers import BACI

from src.data.config import BASE_YEAR
from src.data.helpers import deflate_to_constant_usd
from src.data.s301_analysis.constants import S301_COUNTRIES, YEAR_RANGE, HS_CHAPTER_NAMES

__all__ = ["S301_COUNTRIES", "YEAR_RANGE", "HS_CHAPTER_NAMES", "build_context_table"]

# Reference year for constant-USD deflation — use shared BASE_YEAR from config
_BASE_YEAR = BASE_YEAR
# Divisor to convert USD thousands -> USD billions  (1 bn = 1 000 000 thousands)
_K_TO_BN = 1_000_000


# -- Internal helpers ---------------------------------------------------------

def _chapter(code) -> str:
    """Return the 2-digit HS chapter from any product-code format."""
    return str(code).zfill(6)[:2]


def _load_baci_raw() -> pd.DataFrame:
    """Load BACI HS22 global bilateral data via the bblocks cache."""
    baci = BACI()
    return baci.get_data(hs_version="HS22", include_country_labels=True)


def _annual_avg(
    df: pd.DataFrame,
    exporter_col: str,
    group_extra: list[str] | None = None,
) -> pd.DataFrame:
    """Annual totals per (exporter, year[, extra]), then average across years."""
    group1 = [exporter_col, "year"] + (group_extra or [])
    group2 = [exporter_col] + (group_extra or [])
    return (
        df.groupby(group1, observed=True)["value"]
        .sum()
        .groupby(group2)
        .mean()
        .reset_index()
    )


# -- Core computations --------------------------------------------------------

def compute_avg_exports_to_us(
    raw: pd.DataFrame, iso3_list: list[str]
) -> pd.DataFrame:
    df = raw[
        raw["exporter_iso3_code"].isin(iso3_list) &
        (raw["importer_iso3_code"] == "USA")
    ]
    return (
        _annual_avg(df, "exporter_iso3_code")
        .rename(columns={"exporter_iso3_code": "iso3", "value": "avg_exports_to_us"})
    )


def compute_total_exports(
    raw: pd.DataFrame, iso3_list: list[str]
) -> pd.DataFrame:
    df = raw[raw["exporter_iso3_code"].isin(iso3_list)]
    return (
        _annual_avg(df, "exporter_iso3_code")
        .rename(columns={"exporter_iso3_code": "iso3", "value": "total_avg_exports"})
    )


def compute_us_exports_to_targets(
    raw: pd.DataFrame, iso3_list: list[str]
) -> pd.DataFrame:
    df = raw[
        (raw["exporter_iso3_code"] == "USA") &
        raw["importer_iso3_code"].isin(iso3_list)
    ]
    return (
        _annual_avg(df, "importer_iso3_code")
        .rename(columns={"importer_iso3_code": "iso3", "value": "us_exports_to_country"})
    )


def compute_top_chapters(
    raw: pd.DataFrame,
    iso3_list: list[str],
    n: int = 3,
) -> pd.DataFrame:
    """Top N HS chapters by avg annual exports to the US, returned in wide format."""
    df = raw[
        raw["exporter_iso3_code"].isin(iso3_list) &
        (raw["importer_iso3_code"] == "USA")
    ].copy()
    df["chapter"] = df["product_code"].apply(_chapter)

    chapter_avgs = (
        _annual_avg(df, "exporter_iso3_code", group_extra=["chapter"])
        .rename(columns={"exporter_iso3_code": "iso3", "value": "avg_exports"})
    )

    rows: list[dict] = []
    for iso3, group in chapter_avgs.groupby("iso3"):
        top = group.nlargest(n, "avg_exports").reset_index(drop=True)
        row: dict = {"iso3": iso3}
        for rank, (_, r) in enumerate(top.iterrows(), start=1):
            ch = r["chapter"]
            row[f"top_chapter_{rank}"] = f"{ch} — {HS_CHAPTER_NAMES.get(ch, 'Unknown')}"
            # Values are already in constant USD thousands; convert to billions
            row[f"top_chapter_{rank}_exports"] = round(r["avg_exports"] / _K_TO_BN, 2)
        rows.append(row)

    return pd.DataFrame(rows)


# -- Public API ---------------------------------------------------------------

def build_context_table(
    year_range: range = YEAR_RANGE,
    base_year: int = _BASE_YEAR,
) -> pd.DataFrame:
    """Assemble the display-ready context table for the 7 S301-targeted countries.

    Loads BACI, filters to the relevant exporters and years, deflates using IMF
    GDP deflators (each country's own), converts to constant ``base_year`` USD
    billions, and returns a table ready for display or CSV export.
    """
    iso3_list = list(S301_COUNTRIES.keys())

    print("  Loading BACI data (cached after first download)...")
    raw = _load_baci_raw()

    # Filter to relevant rows and years before deflation — avoids running
    # pydeflate over the entire BACI dataset (all country-pairs, all years).
    print(f"  Filtering to target countries and years {list(year_range)}...")
    relevant = raw[
        raw["year"].isin(year_range) &
        (
            raw["exporter_iso3_code"].isin(iso3_list) |
            (
                (raw["exporter_iso3_code"] == "USA") &
                raw["importer_iso3_code"].isin(iso3_list)
            )
        )
    ].copy()

    print(f"  Deflating to constant {base_year} USD (IMF GDP deflator per exporter)...")
    relevant = deflate_to_constant_usd(relevant, id_column="exporter_iso3_code", base_year=base_year)

    print("  Computing trade metrics...")
    exports_us   = compute_avg_exports_to_us(relevant, iso3_list)
    total_exp    = compute_total_exports(relevant, iso3_list)
    us_to_africa = compute_us_exports_to_targets(relevant, iso3_list)
    top_chapters = compute_top_chapters(relevant, iso3_list)

    table = (
        pd.DataFrame({
            "iso3":    list(S301_COUNTRIES.keys()),
            "country": list(S301_COUNTRIES.values()),
        })
        .merge(exports_us,   on="iso3", how="left")
        .merge(total_exp,    on="iso3", how="left")
        .merge(us_to_africa, on="iso3", how="left")
        .merge(top_chapters, on="iso3", how="left")
    )

    # Export share
    table["export_share_us"] = (
        table["avg_exports_to_us"] / table["total_avg_exports"] * 100
    ).round(2)

    # Trade position — categorical
    table["trade_position"] = (
        (table["avg_exports_to_us"] - table["us_exports_to_country"])
        .apply(lambda x: "Net exporter" if x >= 0 else "Net importer")
    )

    # Convert USD thousands -> USD billions for summary columns
    # (chapter exports were already converted inside compute_top_chapters)
    for col in ("avg_exports_to_us", "total_avg_exports"):
        table[col] = (table[col] / _K_TO_BN).round(2)

    # Drop internal columns not needed in the output
    table = table.drop(columns=["iso3", "us_exports_to_country"])

    # Rename to display-friendly headers
    rename_map = {
        "country":           "Country",
        "avg_exports_to_us": f"Exports to US (const. {_BASE_YEAR} USD bn)",
        "export_share_us":   "US Export Share (%)",
        "trade_position":    "Trade Position (vs US)",
    }
    for rank in range(1, 4):
        rename_map[f"top_chapter_{rank}"]         = f"Top US Export {rank}"
        rename_map[f"top_chapter_{rank}_exports"] = f"Export Value {rank} (const. {_BASE_YEAR} USD bn)"
    table = table.rename(columns=rename_map)

    # Final column order
    ordered = [
        "Country",
        f"Exports to US (const. {_BASE_YEAR} USD bn)",
        "US Export Share (%)",
        "Trade Position (vs US)",
    ]
    for rank in range(1, 4):
        ordered += [
            f"Top US Export {rank}",
            f"Export Value {rank} (const. {_BASE_YEAR} USD bn)",
        ]
    return table[ordered].sort_values(
        by=[
            "Trade Position (vs US)",
            f"Exports to US (const. {_BASE_YEAR} USD bn)",
            "US Export Share (%)"
        ],
        ascending=[True, False, False]
    )


if __name__ == "__main__":
    from pathlib import Path
    out = Path(__file__).parent / "output"
    out.mkdir(parents=True, exist_ok=True)
    df = build_context_table()
    path = out / "1_trade_context.csv"
    df.to_csv(path, index=False)
    print(f"\nSaved -> {path}")
    pd.set_option("display.float_format", "{:,.2f}".format)
    pd.set_option("display.max_columns", 20)
    pd.set_option("display.width", 220)
    print(df.to_string(index=False))
