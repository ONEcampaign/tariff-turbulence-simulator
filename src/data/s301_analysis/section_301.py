"""Section 301 Forced Labor Tariff — ETR impact analysis.

Computes ETR estimates under two scenarios for all African countries and writes
four output CSVs to src/data/s301_analysis/output/:

  1_trade_context.csv  Country-level trade context (via BACI, 2022-2024)
  2_country_etr.csv    Country-level baseline vs S301 ETR comparison
  3_group_etr.csv      Sector-group-level ETR comparison (from hs_groups.json)
  4_chapter_etr.csv    Chapter-level (2-digit HS) ETR comparison

Scenario definitions
  baseline  All tariffs currently in effect: Section 232 product tariffs
            (steel, aluminum, copper, autos, timber, pharma) + Section 122
            country rates (country_specific_tariffs.json). Excludes S301.
  s301      Section 232 product tariffs + S301 Annex A exemptions at 0% +
            S301 12.5% duty for the seven targeted African countries as country
            fallback. Section 122 country rates are NOT applied (replaced by S301).

The seven S301-targeted economies are:
  Algeria (DZA), Angola (AGO), Egypt (EGY), Libya (LBY), Morocco (MAR),
  Nigeria (NGA), South Africa (ZAF)

All African countries present in the USTrade data are included in outputs 2–4.

ETR values are expressed as percentages (0–100).
Trade values are in constant 2024 USD (deflated via IMF GDP deflators).
  - BACI (trade_context): values originally in current USD thousands (CEPII).
  - USTrade (ETR tables): values originally in current USD (US Census Bureau).

Limitations
  - Action is PROPOSED as of June 10, 2026; comment period closes July 6, 2026.
  - S301 Annex A "Ex"-scoped codes are modelled as fully exempt (no description
    field in trade data to distinguish intra-subheading scope).

Run with:  python -m src.data.s301_analysis.section_301
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
S301_ANNEX_A = PATHS.TARIFFS / "section_301_annex_a_exemptions_06_02_2026.json"

# Product-level tariff paths — mirrors UStradeLoader.add_rate_columns().
# Used to build the S301 scenario product rate map (same product rules as baseline).
_PRODUCT_RATE_PATHS: list[Path] = [
    PATHS.ALUMINUM,
    PATHS.STEEL,
    PATHS.COPPER,
    PATHS.SAC_DERIVATIVES,
    PATHS.AUTOS,
    PATHS.BUSES,
    PATHS.MHDV,
    PATHS.TIMBER_SOFTWOOD,
    PATHS.TIMBER_FURNITURE,
    PATHS.ANNEX_III_SAC,
    PATHS.EXEMPTIONS_S122,
    PATHS.PHARMA_PATENTED,
]


# ── S301 rate builder ──────────────────────────────────────────────────────────

def build_s301_rate_column(
    df: pd.DataFrame,
    loader: UStradeLoader,
    s301_map: dict[str, float],
) -> pd.DataFrame:
    """Add ``s301_rate`` column using product-specific S232 rates + S301 country fallback.

    Constructs the S301 scenario rate independently of the baseline ``rate`` column:
      - Same product-level rate map as baseline (S232, timber, pharma, S122 exemptions).
      - S301 Annex A codes at 0.0 — explicitly excluded from the S301 action.
      - Country-level fallback: S301 rate (12.5%) for targeted countries, 0.0 otherwise.
        Section 122 country rates are not applied in the S301 scenario.

    Args:
        df: Trade data with baseline ``rate`` column already set.
        loader: UStradeLoader instance (provides build_code_rate_map / assign_tariff_rate).
        s301_map: {iso3: rate} for the seven S301-targeted countries.

    Returns:
        Copy of df with ``s301_rate`` column added.
    """
    product_rate_map = loader.build_code_rate_map(_PRODUCT_RATE_PATHS + [S301_ANNEX_A])
    s301_df = loader.assign_tariff_rate(df, product_rate_map, s301_map, default_rate=0.0)
    df = df.copy()
    df["s301_rate"] = s301_df["rate"]
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

def _load_and_prepare() -> pd.DataFrame:
    """Load trade data, assign baseline and S301 rates.

    Returns df with both 'rate' (baseline) and 's301_rate' (S301 scenario) columns.

    Pipeline mirrors UStradeLoader.load() but stops before ETR/population:
      load_data → sector groups → normalize → deflate → average_years → rates → s301_rate
    """
    loader = UStradeLoader()
    df = loader.load_data()
    df = add_sector_group_column(df)
    df = loader.normalize_country_names(df)
    df = loader.deflate(df)
    df = loader.average_years(df)
    df = loader.add_rate_columns(df)  # 'rate' = baseline: S232 products + S122 country rates

    s301_data = load_json(S301_PATH)
    s301_map = {
        iso3: info["rate"]
        for iso3, info in s301_data.items()
        if isinstance(info, dict) and "rate" in info
    }
    df = build_s301_rate_column(df, loader, s301_map)  # adds 's301_rate'
    return df


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


def run_country_etr(df: pd.DataFrame) -> pd.DataFrame:
    """Country-level baseline vs S301 ETR for all African countries.

    Expects df to already have both 'rate' and 's301_rate' columns
    (produced by ``_load_and_prepare``).

    Columns: country, iso3, total_exports, baseline_etr, s301_etr, s301_delta
    ETR values are in percent (0–100).
    """
    return (
        _build_etr_table(
            baseline_df=etr_by_country(df, "rate").rename(columns={"etr": "baseline_etr"}),
            s301_df=etr_by_country(df, "s301_rate"),
            merge_keys=["country", "iso3", "total_exports"],
        )
        .sort_values("country")
        .reset_index(drop=True)
    )


def run_group_etr(df: pd.DataFrame) -> pd.DataFrame:
    """Sector-group-level baseline vs S301 ETR for all African countries.

    Expects df to already have both 'rate' and 's301_rate' columns
    (produced by ``_load_and_prepare``).

    Columns: country, iso3, sector, total_exports, baseline_etr, s301_etr, s301_delta
    ETR values are in percent (0–100). Rows are sorted by country then delta desc.
    """
    return (
        _build_etr_table(
            baseline_df=etr_by_group(df, "rate").rename(columns={"etr": "baseline_etr"}),
            s301_df=etr_by_group(df, "s301_rate"),
            merge_keys=["country", "iso3", "sector", "total_exports"],
        )
        .sort_values(["country", "s301_delta"], ascending=[True, False])
        .reset_index(drop=True)
    )


def run_chapter_etr(df: pd.DataFrame) -> pd.DataFrame:
    """Chapter-level (2-digit HS) baseline vs S301 ETR for all African countries.

    Expects df to already have both 'rate' and 's301_rate' columns
    (produced by ``_load_and_prepare``).

    Columns: country, iso3, chapter, chapter_name, total_exports,
             baseline_etr, s301_etr, s301_delta
    ETR values are in percent (0–100). Rows are sorted by country then delta desc.
    Chapters with zero export activity are excluded; chapters with no S301 impact
    (s301_delta == 0) are retained to show fully-exempt product categories.
    """
    return (
        _build_etr_table(
            baseline_df=etr_by_chapter(df, "rate").rename(columns={"etr": "baseline_etr"}),
            s301_df=etr_by_chapter(df, "s301_rate"),
            merge_keys=["country", "iso3", "chapter", "chapter_name", "total_exports"],
        )
        .sort_values(["country", "s301_delta"], ascending=[True, False])
        .reset_index(drop=True)
    )


# ── Output formatting ─────────────────────────────────────────────────────────

#: Raw USD -> USD millions (USTrade exports are in USD, not thousands)
_USD_TO_MN = 1_000_000

_ETR_RENAME: dict[str, str] = {
    "country":       "Country",
    "sector":        "Sector",
    "chapter":       "Chapter",
    "chapter_name":  "Chapter Name",
    "total_exports": "Annual Export to the US ($ million)",
    "baseline_etr":  "Baseline ETR (%)",
    "s301_etr":      "S301 ETR (%)",
    "s301_delta":    "ETR Change (pp)",
}


def _format_etr_table(df: pd.DataFrame) -> pd.DataFrame:
    """Return a display-ready copy of an ETR table.

    - Drops ``iso3``
    - Converts ``total_exports`` from USD to USD millions
    - Rounds all numeric columns to 2 decimal places
    - Renames columns to display-friendly headers
    """
    out = df.drop(columns=["iso3"], errors="ignore").copy()
    out["total_exports"] = (out["total_exports"] / _USD_TO_MN).round(1)
    num_cols = out.select_dtypes("number").columns
    out[num_cols] = out[num_cols].round(1)
    return out.rename(columns=_ETR_RENAME)


# ── Affected export share ─────────────────────────────────────────────────────

def compute_export_share_affected_countries(year: int | None = None) -> pd.DataFrame:
    """Share of each S301-targeted country's exports in all African exports to the US.

    Builds its own pipeline (load → normalize → deflate) so it can filter to a
    specific year without touching the averaged ``_load_and_prepare`` data.
    When ``year`` is None all years in the analysis window are used and monetary
    values are annual averages; the share is computed from totals so year-count
    divisions cancel.

    Args:
        year: Calendar year to filter to (e.g. 2024). None uses all years.

    Returns:
        One row per targeted country with columns:
          country, iso3, country_exports_mn, africa_total_exports_mn,
          share_of_africa_pct
        Monetary values in constant 2024 USD millions.
    """
    from src.data.s301_analysis.constants import S301_COUNTRIES

    from src.data.config import BASE_YEAR

    loader = UStradeLoader()
    raw = loader.load_data()
    raw = loader.normalize_country_names(raw)

    if year is not None:
        raw = raw[raw["year"] == year]

    # Deflating to constant BASE_YEAR USD is a no-op for BASE_YEAR data itself
    # (factor = 1). Skip it to preserve countries whose deflators are missing
    # (e.g. Eritrea), since current BASE_YEAR USD == constant BASE_YEAR USD.
    if year != BASE_YEAR:
        raw = loader.deflate(raw)

    n_years = raw["year"].nunique() or 1
    africa_total = raw["exports"].sum()

    rows = []
    for iso3, country in S301_COUNTRIES.items():
        country_exports = raw.loc[raw["iso3"] == iso3, "exports"].sum()
        rows.append({
            "iso3": iso3, "country": country,
            "country_exports": country_exports,
            "africa_total": africa_total,
        })

    result = pd.DataFrame(rows)
    result["share"] = result["country_exports"] / result["africa_total"]
    result["country_exports_mn"] = (result["country_exports"] / n_years / _USD_TO_MN).round(1)
    result["africa_total_exports_mn"] = (result["africa_total"] / n_years / _USD_TO_MN).round(1)
    result["share_of_africa_pct"] = (result["share"] * 100).round(1)

    return (
        result
        .drop(columns=["country_exports", "africa_total", "share"])
        .sort_values("share_of_africa_pct", ascending=False)
        .reset_index(drop=True)
    )


# ── Legacy compatibility ───────────────────────────────────────────────────────

def run() -> pd.DataFrame:
    """Return country-level ETR comparison (backward-compatible entry point)."""
    return run_country_etr(_load_and_prepare())


# ── CLI entry point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ── Output 1: Trade context (BACI) ─────────────────────────────────────────
    print("Building trade context table (BACI)…")
    context = trade_context.build_context_table()
    context.to_csv(OUTPUT_DIR / "1_trade_context.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '1_trade_context.csv'}")

    print("\nBuilding ETR tables (USTrade)…")
    df = _load_and_prepare()

    # ── Output 2: Country-level ETR ────────────────────────────────────────────
    print("  Computing country ETR…")
    country_etr = run_country_etr(df)
    formatted_country = _format_etr_table(country_etr)
    formatted_country["Direction"] = country_etr["s301_delta"].map(
        lambda x: "Up" if x > 0 else ("Down" if x < 0 else "No change")
    )
    formatted_country.to_csv(OUTPUT_DIR / "2_country_etr.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '2_country_etr.csv'}")

    # ── Output 3: Sector-group ETR ─────────────────────────────────────────────
    print("  Computing sector-group ETR…")
    group_etr = run_group_etr(df)
    _format_etr_table(group_etr).to_csv(OUTPUT_DIR / "3_group_etr.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '3_group_etr.csv'}")

    # ── Output 4: Chapter-level ETR ────────────────────────────────────────────
    print("  Computing chapter ETR…")
    chapter_etr = run_chapter_etr(df)
    _format_etr_table(chapter_etr).to_csv(OUTPUT_DIR / "4_chapter_etr.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '4_chapter_etr.csv'}")

    # ── Output 5: Affected export share ───────────────────────────────────────
    print("  Computing affected export share (2024)…")
    affected = compute_export_share_affected_countries(year=2024)
    affected.drop(columns=["iso3"]).rename(columns={
        "country":                "Country",
        "country_exports_mn":     "Annual Export to the US ($ million)",
        "africa_total_exports_mn":"Africa Total Exports ($ million)",
        "share_of_africa_pct":    "Share of Africa Exports (%)",
    }).to_csv(OUTPUT_DIR / "5_affected_share.csv", index=False)
    print(f"  -> {OUTPUT_DIR / '5_affected_share.csv'}")

    print("\nDone.")

