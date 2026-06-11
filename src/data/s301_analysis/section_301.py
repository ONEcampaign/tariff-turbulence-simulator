"""Section 301 Forced Labor Tariff — ETR impact analysis.

Computes ETR estimates under two scenarios for African countries targeted by
the June 2, 2026 Section 301 proposed action and writes four output CSVs to
src/data/analysis/output/:

  1_trade_context.csv  Country-level trade context (via BACI, 2022-2024)
  2_country_etr.csv    Country-level baseline vs S301 ETR comparison
  3_group_etr.csv      Sector-group-level ETR comparison (from hs_groups.json)
  4_chapter_etr.csv    Chapter-level (2-digit HS) ETR comparison

Scenario definitions
  baseline_etr  existing pipeline: Section 122 country rates + product tariffs
  s301_etr      S301 counterfactual: adds 12.5 pp to targeted countries for
                products not exempt under Section 232 or S301 Annex A

The seven targeted economies are:
  Algeria (DZA), Angola (AGO), Egypt (EGY), Libya (LBY), Morocco (MAR),
  Nigeria (NGA), South Africa (ZAF)

ETR values are expressed as percentages (0–100).
Trade values are in constant 2024 USD (deflated via IMF GDP deflators).
  - BACI (trade_context): values originally in current USD thousands (CEPII).
  - USTrade (ETR tables): values originally in current USD (US Census Bureau).

Limitations
  - Action is PROPOSED as of June 10, 2026; comment period closes July 6, 2026.
  - Section 232 exemption uses product-code prefix matching only; intra-subheading
    ("Ex") scopes in S301 Annex A are modelled as fully exempt.

Run with:  python -m src.data.analysis.section_301
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.data.config import PATHS
from src.data.helpers import add_sector_group_column, load_json
from src.data.loaders.ustrade import UStradeLoader
from src.data import etr
from src.data.s301_analysis import trade_context
from src.data.s301_analysis.constants import HS_CHAPTER_NAMES

# ── Paths ──────────────────────────────────────────────────────────────────────

OUTPUT_DIR = Path(__file__).parent / "output"

S301_PATH = PATHS.TARIFFS / "section_301_forced_labor_06_02_2026.json"

# Products exempt from S301 stacking:
#   - S232-subject goods (steel, aluminum, copper, autos, etc.) — explicitly
#     excluded by the S301 FRN text.
#   - S301 Annex A goods — explicitly excluded by Annex A of the June 2, 2026 FRN.
# Note: IEEPA/Section 122 exemptions (EXEMPTIONS_1/2/3) are intentionally NOT
# included here — exemption from Section 122 does not confer exemption from
# Section 301, which is a separate authority with its own exclusion list.
S301_ANNEX_A = PATHS.TARIFFS / "section_301_annex_a_exemptions_06_02_2026.json"

S301_EXEMPT_PATHS = [
    PATHS.STEEL,
    PATHS.ALUMINUM,
    PATHS.COPPER,
    PATHS.SAC_DERIVATIVES,
    PATHS.AUTOS,
    PATHS.BUSES,
    PATHS.MHDV,
    S301_ANNEX_A,
]


# ── S301 rate helpers ──────────────────────────────────────────────────────────

def build_s301_exempt_prefix_set(json_paths: list[Path]) -> set[str]:
    """Return normalised code prefixes for products exempt from S301 stacking.

    Only loads ``codes`` entries. ``exceptions`` within S232 files are
    intentionally excluded — those goods are not 'subject to section 232
    tariffs' and ARE subject to Section 301.
    """
    prefixes: set[str] = set()
    for path in json_paths:
        data = load_json(path)
        for code in data.get("codes", []):
            prefixes.add(str(code).replace(".", "").strip())
    return prefixes


def add_s301_rate_column(
    df: pd.DataFrame,
    s301_map: dict[str, float],
    s301_exempt_prefixes: set[str],
) -> pd.DataFrame:
    """Add ``s301_rate`` column: baseline rate + Section 301 additional duty.

    Section 301 stacks on top of the baseline rate for targeted countries,
    except for products whose code matches a prefix in ``s301_exempt_prefixes``.

    Builds a per-unique-code exemption set once, then uses vectorised operations —
    O(unique_codes × exempt_prefixes) rather than O(rows × exempt_prefixes).
    """
    sorted_exempt = sorted(s301_exempt_prefixes, key=len, reverse=True)

    exempt_codes: set[str] = {
        str(code)
        for code in df["product_code"].unique()
        if any(str(code).startswith(p) for p in sorted_exempt)
    }

    df = df.copy()
    additional = df["iso3"].map(s301_map).fillna(0.0)
    additional = additional.where(~df["product_code"].astype(str).isin(exempt_codes), 0.0)
    df["s301_rate"] = df["rate"] + additional
    return df


# ── ETR computation helpers ────────────────────────────────────────────────────

def _rename_rate(df: pd.DataFrame, rate_col: str) -> pd.DataFrame:
    """Return df with ``rate_col`` renamed to 'rate' (no-op if already 'rate')."""
    if rate_col == "rate":
        return df.copy()
    return df.drop(columns=["rate"]).rename(columns={rate_col: "rate"})


def etr_by_country(df: pd.DataFrame, rate_col: str) -> pd.DataFrame:
    """Compute country-level ETR (all sectors aggregated) using ``rate_col``."""
    df_agg = _rename_rate(df.assign(sector="All sectors"), rate_col)
    result = etr.compute_etr_by_group(df_agg)
    return result[["country", "iso3", "total_exports", "etr"]]


def etr_by_group(df: pd.DataFrame, rate_col: str) -> pd.DataFrame:
    """Compute (country, sector-group)-level ETR using ``rate_col``.

    Sector groups are defined in ``src/data/inputs/hs_groups.json`` and already
    assigned to each row via ``add_sector_group_column``.
    """
    df_g = _rename_rate(df, rate_col)
    result = etr.compute_etr_by_group(df_g)  # default group_cols: country, iso3, sector
    return result[["country", "iso3", "sector", "total_exports", "etr"]]


def etr_by_chapter(df: pd.DataFrame, rate_col: str) -> pd.DataFrame:
    """Compute (country, chapter)-level ETR using ``rate_col``.

    ``chapter`` is the 2-digit HS chapter derived from ``product_code``.
    A ``chapter_name`` column with a human-readable description is appended.
    """
    df_ch = _rename_rate(df, rate_col)
    df_ch["chapter"] = df_ch["product_code"].str[:2]
    result = etr.compute_etr_by_group(df_ch, group_cols=["country", "iso3", "chapter"])
    result["chapter_name"] = result["chapter"].map(HS_CHAPTER_NAMES).fillna("Unknown")
    return result[["country", "iso3", "chapter", "chapter_name", "total_exports", "etr"]]


# ── Analysis pipeline ──────────────────────────────────────────────────────────

def _load_and_prepare() -> tuple[pd.DataFrame, dict[str, float]]:
    """Load trade data, assign baseline and S301 rates.

    Returns (df, s301_map) where df already has 'rate' and 's301_rate' columns.

    Pipeline mirrors UStradeLoader.load() but stops before ETR/population:
      load_data (per-year) → sector groups → normalize → deflate → average_years → rates → s301_rate
    """
    loader = UStradeLoader()
    df = loader.load_data()
    df = add_sector_group_column(df)
    df = loader.normalize_country_names(df)
    df = loader.deflate(df)
    df = loader.average_years(df)
    df = loader.add_rate_columns(df)

    s301_exempt_prefixes = build_s301_exempt_prefix_set(S301_EXEMPT_PATHS)
    s301_data = load_json(S301_PATH)
    s301_map = {
        iso3: info["rate"]
        for iso3, info in s301_data.items()
        if isinstance(info, dict) and "rate" in info
    }
    df = add_s301_rate_column(df, s301_map, s301_exempt_prefixes)
    return df, s301_map


def _build_etr_table(
    baseline_df: pd.DataFrame,
    s301_df: pd.DataFrame,
    merge_keys: list[str],
) -> pd.DataFrame:
    """Merge baseline and S301 ETR frames, compute delta, convert to percent."""
    result = (
        baseline_df
        .merge(s301_df[merge_keys + ["etr"]].rename(columns={"etr": "s301_etr"}),
               on=merge_keys)
        .assign(s301_delta=lambda x: x["s301_etr"] - x["baseline_etr"])
    )
    result[["baseline_etr", "s301_etr", "s301_delta"]] *= 100
    return result


def run_country_etr(
    df: pd.DataFrame,
    s301_map: dict[str, float],
) -> pd.DataFrame:
    """Country-level baseline vs S301 ETR for targeted countries.

    Expects df to already have both 'rate' and 's301_rate' columns
    (produced by ``_load_and_prepare``).

    Columns: country, iso3, total_exports, baseline_etr, s301_etr, s301_delta
    ETR values are in percent (0–100).
    """
    s301_iso3 = set(s301_map.keys())

    result = (
        _build_etr_table(
            baseline_df=etr_by_country(df, "rate").rename(columns={"etr": "baseline_etr"}),
            s301_df=etr_by_country(df, "s301_rate"),
            merge_keys=["country", "iso3", "total_exports"],
        )
        .query("iso3 in @s301_iso3")
        .sort_values("country")
        .reset_index(drop=True)
    )
    return result


def run_group_etr(
    df: pd.DataFrame,
    s301_map: dict[str, float],
) -> pd.DataFrame:
    """Sector-group-level baseline vs S301 ETR for targeted countries.

    Expects df to already have both 'rate' and 's301_rate' columns
    (produced by ``_load_and_prepare``).

    Columns: country, iso3, sector, total_exports, baseline_etr, s301_etr, s301_delta
    ETR values are in percent (0–100). Rows are sorted by country then delta desc.
    """
    s301_iso3 = set(s301_map.keys())

    result = (
        _build_etr_table(
            baseline_df=etr_by_group(df, "rate").rename(columns={"etr": "baseline_etr"}),
            s301_df=etr_by_group(df, "s301_rate"),
            merge_keys=["country", "iso3", "sector", "total_exports"],
        )
        .query("iso3 in @s301_iso3")
        .sort_values(["country", "s301_delta"], ascending=[True, False])
        .reset_index(drop=True)
    )
    return result


def run_chapter_etr(
    df: pd.DataFrame,
    s301_map: dict[str, float],
) -> pd.DataFrame:
    """Chapter-level (2-digit HS) baseline vs S301 ETR for targeted countries.

    Expects df to already have both 'rate' and 's301_rate' columns
    (produced by ``_load_and_prepare``).

    Columns: country, iso3, chapter, chapter_name, total_exports,
             baseline_etr, s301_etr, s301_delta
    ETR values are in percent (0–100). Rows are sorted by country then delta desc.
    Chapters with zero export activity are excluded; chapters with no S301 impact
    (s301_delta == 0) are retained to show fully-exempt product categories.
    """
    s301_iso3 = set(s301_map.keys())

    baseline_ch = etr_by_chapter(df, "rate").rename(columns={"etr": "baseline_etr"})
    s301_ch = etr_by_chapter(df, "s301_rate")

    result = (
        _build_etr_table(
            baseline_df=baseline_ch,
            s301_df=s301_ch,
            merge_keys=["country", "iso3", "chapter", "chapter_name", "total_exports"],
        )
        .query("iso3 in @s301_iso3")
        .sort_values(["country", "s301_delta"], ascending=[True, False])
        .reset_index(drop=True)
    )
    return result


# ── Output formatting ─────────────────────────────────────────────────────────

#: Raw USD -> USD billions (USTrade exports are in USD, not thousands)
_USD_TO_BN = 1_000_000_000

_ETR_RENAME: dict[str, str] = {
    "country":      "Country",
    "sector":       "Sector",
    "chapter":      "Chapter",
    "chapter_name": "Chapter Name",
    "total_exports": "Total Exports (const. 2024 USD bn)",
    "baseline_etr": "Baseline ETR (%)",
    "s301_etr":     "S301 ETR (%)",
    "s301_delta":   "ETR Change (pp)",
}


def _format_etr_table(df: pd.DataFrame) -> pd.DataFrame:
    """Return a display-ready copy of an ETR table.

    - Drops ``iso3``
    - Converts ``total_exports`` from USD to USD billions
    - Rounds all numeric columns to 2 decimal places
    - Renames columns to display-friendly headers
    """
    out = df.drop(columns=["iso3"], errors="ignore").copy()
    out["total_exports"] = (out["total_exports"] / _USD_TO_BN).round(2)
    num_cols = out.select_dtypes("number").columns
    out[num_cols] = out[num_cols].round(2)
    return out.rename(columns=_ETR_RENAME)


# ── Legacy compatibility ───────────────────────────────────────────────────────

def run() -> pd.DataFrame:
    """Return country-level ETR comparison (backward-compatible entry point)."""
    df, s301_map = _load_and_prepare()
    return run_country_etr(df, s301_map)


# ── CLI entry point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── Output 1: Trade context (BACI) ─────────────────────────────────────────
    print("Building trade context table (BACI)…")
    context = trade_context.build_context_table()
    context.to_csv(OUTPUT_DIR / "1_trade_context.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '1_trade_context.csv'}")

    print("\nBuilding ETR tables (USTrade)…")
    df, s301_map = _load_and_prepare()

    # ── Output 2: Country-level ETR ────────────────────────────────────────────
    print("  Computing country ETR…")
    country_etr = run_country_etr(df, s301_map)
    _format_etr_table(country_etr).to_csv(OUTPUT_DIR / "2_country_etr.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '2_country_etr.csv'}")

    # ── Output 3: Sector-group ETR ─────────────────────────────────────────────
    print("  Computing sector-group ETR…")
    group_etr = run_group_etr(df, s301_map)
    _format_etr_table(group_etr).to_csv(OUTPUT_DIR / "3_group_etr.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '3_group_etr.csv'}")

    # ── Output 4: Chapter-level ETR ────────────────────────────────────────────
    print("  Computing chapter ETR…")
    chapter_etr = run_chapter_etr(df, s301_map)
    _format_etr_table(chapter_etr).to_csv(OUTPUT_DIR / "4_chapter_etr.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '4_chapter_etr.csv'}")

    print("\nDone.")

