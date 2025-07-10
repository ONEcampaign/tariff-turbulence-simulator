"""Loader which combines US trade data with ETR and population data.

This module fetches recent US import data and combines it with tariff
information to compute Effective Tariff Rates (ETR) and population figures.
"""

from pathlib import Path

import pandas as pd
import country_converter as coco
from bblocks.data_importers import WEO

from src.data.config import PATHS
from src.data.helpers import add_sector_group_column, load_json
from src.data import etr

YEAR_RANGE = range(2022, 2025)


class UStradeLoader:
    """Loader for recent US trade data and tariff calculations."""

    def load(self) -> pd.DataFrame:
        """Return fully processed trade data ready for export."""

        df = self.load_data()
        df = add_sector_group_column(df)
        df = self.add_rate_columns(df)
        df = self.add_etr_column(df)
        df = self.normalize_country_names(df)
        df = self.add_population_column(df)
        ordered_columns = ["country", "iso3", "sector", "exports", "etr", "population"]
        return df[ordered_columns]

    def load_data(self) -> pd.DataFrame:
        """Load raw CSV files with US trade data and compute mean values by exporter country and product."""
        raw_dfs = []
        for y in YEAR_RANGE:
            d = pd.read_csv(PATHS.INPUTS / f"africa_exports_to_us_{y}_ustrade_raw.csv")
            d = self.clean_columns(d)
            raw_dfs.append(d)
        raw_df = pd.concat(raw_dfs)
        df = (
            raw_df.groupby(["country", "product_code"], observed=True, dropna=False)[
                "exports"
            ]
            .mean()
            .reset_index()
        )
        return df

    @staticmethod
    def clean_columns(df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names and convert types."""
        column_dict = {
            "Country": "country",
            "Time": "year",
            "Commodity": "product_code",
            "Customs  Value (Cons) ($US)": "exports",
        }
        df = df.rename(columns=column_dict)[column_dict.values()]
        df["product_code"] = df["product_code"].str.extract(r"^(\d{10})")
        df["exports"] = pd.to_numeric(
            df["exports"].str.replace(",", ""), errors="coerce"
        )
        return df

    @staticmethod
    def normalize_country_names(df: pd.DataFrame) -> pd.DataFrame:
        """Convert country names to a consistent short form and add ISO3."""
        cc = coco.CountryConverter()
        df["country"] = cc.pandas_convert(
            df["country"], to="name_short", not_found="All countries"
        )
        df["iso3"] = cc.pandas_convert(df["country"], to="ISO3", not_found="ALL")
        return df

    @staticmethod
    def get_africa_population_data() -> pd.DataFrame:
        """Retrieve population figures for African countries from the WEO and compute 2022-2024 mean values."""
        cc = coco.CountryConverter()
        weo = WEO()
        data = weo.get_data()
        filtered_df = data.query(
            "`indicator_code` == 'LP' and `year` in @YEAR_RANGE"
        ).copy()

        filtered_df["population"] = filtered_df["value"] * filtered_df["scale_code"]
        filtered_df["region"] = cc.pandas_convert(
            filtered_df["entity_name"], to="continent"
        )
        africa_df = filtered_df.query("`region` == 'Africa'")
        africa_df["iso3"] = cc.pandas_convert(africa_df["entity_name"], to="ISO3")

        africa_df_all = pd.DataFrame(
            {"iso3": ["ALL"], "population": [africa_df["population"].sum()]}
        )

        complete_df = pd.concat([africa_df, africa_df_all])

        grouped_df = (
            complete_df.groupby(["iso3"], observed=True, dropna=False)["population"]
            .mean()
            .reset_index()
        )

        return grouped_df

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
        if not self.assert_iso3_code_alignment(df, pop_df):
            raise ValueError("ISO3 code mismatch between dataframes")

        return pd.merge(df, pop_df, on="iso3", how="left", validate="many_to_one")

    @staticmethod
    def build_code_rate_map(json_paths: list[Path]) -> dict:
        """Create a tariff-to-product lookup table based on the JSON files in `src/data/inputs/tariffs/`"""
        rate_map: dict[str, float] = {}
        for path in json_paths:
            data = load_json(path)
            rate = data["rate"]
            for code in data.get("codes", []):
                rate_map[code] = rate
            for code in data.get("exceptions", []):
                rate_map[code] = 0.0
        return rate_map

    def assign_tariff_rate(
        self, df: pd.DataFrame, rate_map: dict, default_rate: float = 0.1
    ) -> pd.DataFrame:
        """Assign a tariff rate to each product_code by prefix lookup."""

        def lookup_rate(code: str) -> float:
            code_str = str(code)
            # Walk backwards through the code string and look for the
            # longest matching prefix in ``rate_map``. This allows
            # product codes of varying length to share a rate.
            for length in range(len(code_str), 3, -1):
                prefix = code_str[:length]
                if prefix in rate_map:
                    return rate_map[prefix]
            return default_rate

        df = df.copy()
        df["rate"] = df["product_code"].apply(lookup_rate)
        return df

    def add_rate_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Adds a rate column with the tariff rate assigned to each product_code in the DataFrame."""
        json_paths = [
            PATHS.ALUMINUM,
            PATHS.STEEL,
            PATHS.AUTOS,
            PATHS.EXEMPTIONS_1,
            PATHS.EXEMPTIONS_2,
        ]
        rate_map = self.build_code_rate_map(json_paths)
        return self.assign_tariff_rate(df, rate_map)

    def add_etr_column(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add Effective Tariff Rate columns for multiple aggregates."""
        variants = [
            {},
            {"sector": "All sectors"},
            {"country": "All countries"},
            {"country": "All countries", "sector": "All sectors"},
        ]
        frames = []
        for iter in variants:
            df_variant = df.assign(**iter)
            frames.append(etr.compute_etr_by_group(df_variant))
        final_df = (
            pd.concat(frames, ignore_index=True)
            .rename(columns={"total_exports": "exports"})
            .loc[:, ["country", "sector", "exports", "etr"]]
            .sort_values(["country", "sector"])
            .reset_index(drop=True)
        )
        return final_df
