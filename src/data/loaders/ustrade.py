"""Loader which combines US trade data with ETR and population data.

This module fetches recent US import data and combines it with tariff
information to compute Effective Tariff Rates (ETR) and population figures.

Trade values are deflated to constant BASE_YEAR USD using each exporter's IMF
GDP deflator before averaging across years, ensuring multi-year comparisons
are in real (inflation-adjusted) terms.
"""

from pathlib import Path

import pandas as pd
import country_converter as coco
from bblocks.data_importers import WorldBank

from src.data.config import BASE_YEAR, PATHS
from src.data.helpers import add_sector_group_column, deflate_to_constant_usd, load_json
from src.data import etr

YEAR_RANGE = range(2022, 2025)

_cc = None


def _get_cc() -> coco.CountryConverter:
    global _cc
    if _cc is None:
        _cc = coco.CountryConverter()
    return _cc


class UStradeLoader:
    """Loader for recent US trade data and tariff calculations."""

    def load(self) -> pd.DataFrame:
        """Return fully processed trade data ready for export.

        Pipeline:
          load_data  →  sector groups  →  normalize country names
          →  deflate (constant BASE_YEAR USD)
          →  average across years
          →  tariff rates  →  ETR  →  population
        """
        df = self.load_data()
        df = add_sector_group_column(df)
        df = self.normalize_country_names(df)
        df = self.deflate(df)
        df = self.average_years(df)
        df = self.add_rate_columns(df)
        df = self.add_etr_column(df)
        df = self.add_population_column(df)
        ordered_columns = ["country", "iso3", "sector", "exports", "etr", "population"]
        return df[ordered_columns]

    def load_data(self) -> pd.DataFrame:
        """Load per-year CSV files and return one row per (year, country, product).

        Callers that need a single average figure across years should call
        ``deflate()`` (to convert to constant USD) followed by
        ``average_years()`` before any further processing.
        """
        raw_dfs = []
        for y in YEAR_RANGE:
            d = pd.read_csv(PATHS.INPUTS / f"africa_exports_to_us_{y}_ustrade_raw.csv")
            d = self.clean_columns(d)
            d["year"] = y
            raw_dfs.append(d)
        return pd.concat(raw_dfs, ignore_index=True)

    @staticmethod
    def clean_columns(df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names and convert types."""
        column_dict = {
            "Country": "country",
            "Commodity": "product_code",
            "Customs  Value (Cons) ($US)": "exports",
        }
        df = df.rename(columns=column_dict)[column_dict.values()]
        df["product_code"] = df["product_code"].str.extract(r"^(\d{10})")
        df = df.dropna(subset=["product_code"])
        df["exports"] = pd.to_numeric(
            df["exports"].str.replace(",", ""), errors="coerce"
        )
        return df

    @staticmethod
    def normalize_country_names(df: pd.DataFrame) -> pd.DataFrame:
        """Convert country names to a consistent short form and add ISO3."""
        cc = _get_cc()
        df = df.copy()
        df["iso3"] = cc.pandas_convert(df["country"], to="ISO3")
        df["country"] = cc.pandas_convert(df["iso3"], to="name_short")
        return df

    @staticmethod
    def deflate(df: pd.DataFrame, base_year: int = BASE_YEAR) -> pd.DataFrame:
        """Deflate ``exports`` from current to constant ``base_year`` USD.

        Requires ``iso3`` and ``year`` columns (call ``normalize_country_names``
        and ensure ``load_data`` has been called before this method).
        """
        return deflate_to_constant_usd(
            df, id_column="iso3", value_column="exports", base_year=base_year
        )

    @staticmethod
    def average_years(df: pd.DataFrame) -> pd.DataFrame:
        """Average ``exports`` across years, collapsing the ``year`` column.

        Groups by all non-year, non-exports columns and computes the mean
        export value, producing one row per (country, product_code[, sector]).
        """
        group_cols = [c for c in df.columns if c not in ("year", "exports")]
        return (
            df.groupby(group_cols, observed=True, dropna=False)["exports"]
            .mean()
            .reset_index()
        )

    @staticmethod
    def get_africa_population_data() -> pd.DataFrame:
        """Retrieve population figures for African countries from the World Bank and compute 2022-2024 mean values."""

        column_map = {
            "entity_code": "iso3",
            "value": "population"
        }

        wb = WorldBank()

        raw_df = (
            wb.get_data(
                indicator_code="SP.POP.TOTL",
                start_year=YEAR_RANGE[0],
                end_year=YEAR_RANGE[-1],
                skip_aggs=True,
                skip_blanks=True,
            )
            .rename(columns=column_map)
        )

        cc = _get_cc()
        africa_codes = raw_df["iso3"][
            cc.pandas_convert(raw_df["iso3"], to="continent") == "Africa"
        ].unique()

        africa_df = raw_df[raw_df["iso3"].isin(africa_codes)].groupby("iso3")["population"].mean().reset_index()

        africa_total = pd.DataFrame(
            {"iso3": ["ALL"], "population": [africa_df["population"].sum()]}
        )

        return pd.concat([africa_df, africa_total], ignore_index=True)

    @staticmethod
    def assert_iso3_code_alignment(df1: pd.DataFrame, df2: pd.DataFrame) -> bool:
        """Ensure the same set of ISO3 codes exists between trade and population dataframes."""
        set1 = set(df1["iso3"].unique())
        set2 = set(df2["iso3"].unique())
        if set1 == set2:
            return True
        only_in_df1 = set1 - set2
        only_in_df2 = set2 - set1
        raise ValueError(
            f"ISO3 code mismatch:\nOnly in df1: {sorted(only_in_df1)}\nOnly in df2: {sorted(only_in_df2)}"
        )

    def add_population_column(self, df: pd.DataFrame) -> pd.DataFrame:
        """Merge trade data with population data"""
        pop_df = self.get_africa_population_data()
        self.assert_iso3_code_alignment(df, pop_df)
        return pd.merge(df, pop_df, on="iso3", how="left", validate="many_to_one")

    @staticmethod
    def build_code_rate_map(json_paths: list[Path]) -> dict:
        """Create a tariff-to-product lookup table based on the JSON files in `src/data/inputs/tariffs/`

        `codes_partial` entries (intra-subheading exemptions distinguishable only by product
        description, not HTS code) are intentionally not modeled — trade data contains no
        description field to filter on, so the full subheading is treated as non-exempt.
        """
        rate_map: dict[str, float] = {}
        for path in json_paths:
            data = load_json(path)
            rate = data["rate"]
            for code in data.get("codes", []):
                rate_map[str(code).replace(".", "")] = rate
            for code in data.get("exceptions", []):
                rate_map[str(code).replace(".", "")] = 0.0
        return rate_map

    @staticmethod
    def assign_tariff_rate(
            df: pd.DataFrame,
            product_rate_map: dict,
            country_rate_map: dict,
            default_rate: float = 0.1
    ) -> pd.DataFrame:
        """Assign tariff rate using the longest matching prefix in product_rate_map
        (most specific rule wins), falling back to country_rate_map, then default_rate.

        Builds a per-unique-code lookup once, then uses vectorised map —
        O(unique_codes × prefixes) rather than O(rows × prefixes).
        """
        sorted_prefixes = sorted(product_rate_map, key=len, reverse=True)

        def _rate_for_code(code: str) -> float | None:
            for prefix in sorted_prefixes:
                if code.startswith(prefix):
                    return product_rate_map[prefix]
            return None

        code_to_rate: dict[str, float | None] = {
            str(code): _rate_for_code(str(code))
            for code in df["product_code"].unique()
        }

        df = df.copy()
        df["rate"] = df["product_code"].map(code_to_rate)
        no_product_match = df["rate"].isna()
        if no_product_match.any():
            df.loc[no_product_match, "rate"] = (
                df.loc[no_product_match, "iso3"]
                .map(country_rate_map)
                .fillna(default_rate)
            )
        return df

    def add_rate_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Adds a rate column with the tariff rate assigned to each product_code in the DataFrame."""
        json_paths = [
            PATHS.ALUMINUM,
            PATHS.STEEL,
            PATHS.COPPER,
            PATHS.SAC_DERIVATIVES,
            PATHS.AUTOS,
            PATHS.BUSES,
            PATHS.MHDV,
            PATHS.TIMBER_SOFTWOOD,
            PATHS.TIMBER_FURNITURE,
            PATHS.ANNEX_III_SAC,    # 15% transitional rate (Apr 6, 2026 – Dec 31, 2027); comes after SAC_DERIVATIVES so 15% overrides 25% for any overlapping codes
            PATHS.EXEMPTIONS_S122,
            PATHS.PHARMA_PATENTED,  # Must come after EXEMPTIONS_S122: overrides any prior pharma exemptions for patented codes
        ]
        product_rate_map = self.build_code_rate_map(json_paths)

        # Load and convert country rates from nested structure to flat iso3 -> rate
        country_data = load_json(PATHS.COUNTRY_RATES)
        country_rate_map = {
            iso3: info["rate"]
            for iso3, info in country_data.items()
            if isinstance(info, dict) and "rate" in info
        }

        return self.assign_tariff_rate(df, product_rate_map, country_rate_map)

    @staticmethod
    def add_etr_column(df: pd.DataFrame) -> pd.DataFrame:
        """Add Effective Tariff Rate columns for multiple aggregates."""
        variants = [
            {},
            {"sector": "All sectors"},
            {"country": "All countries", "iso3": "ALL"},
            {"country": "All countries", "iso3": "ALL", "sector": "All sectors"},
        ]
        frames = []
        for variant in variants:
            df_variant = df.assign(**variant)
            frames.append(etr.compute_etr_by_group(df_variant))
        final_df = (
            pd.concat(frames, ignore_index=True)
            .rename(columns={"total_exports": "exports"})
            .loc[:, ["country", "iso3", "sector", "exports", "etr"]]
            .sort_values(["country", "sector"])
            .reset_index(drop=True)
        )
        return final_df
