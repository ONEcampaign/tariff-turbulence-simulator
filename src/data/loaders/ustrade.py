"""Loader for USA Trade Online data and tariff simulations.

This module fetches recent US import data and combines it with tariff
information to compute Effective Tariff Rates. It is used by the CLI
scripts in ``src/data`` to produce the CSV outputs consumed by the
visualisation components.
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
        df = self.load_data()
        df = add_sector_group_column(df)
        df = self.add_rate_columns(df)
        df = self.add_etr_column(df)
        df = self.normalize_country_names(df)
        df = self.add_population_column(df)
        ordered_columns = ["country", "iso3", "sector", "exports", "etr", "population"]
        return df[ordered_columns]

    def load_data(self) -> pd.DataFrame:
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
        cc = coco.CountryConverter()
        df["country"] = cc.pandas_convert(
            df["country"], to="name_short", not_found="All countries"
        )
        df["iso3"] = cc.pandas_convert(df["country"], to="ISO3", not_found="ALL")
        return df

    @staticmethod
    def get_africa_population_data() -> pd.DataFrame:
        cc = coco.CountryConverter()
        weo = WEO()
        data = weo.get_data()
        filtered_df = data.query(
            "`indicator_code` == 'LP' and `year` in @YEAR_RANGE"
        ).copy()
        grouped_df = (
            filtered_df.groupby(
                ["entity_name", "scale_code"], observed=True, dropna=False
            )["value"]
            .mean()
            .reset_index()
        )
        grouped_df["population"] = grouped_df["value"] * grouped_df["scale_code"]
        grouped_df["region"] = cc.pandas_convert(
            grouped_df["entity_name"], to="continent"
        )
        africa_df = grouped_df.query("`region` == 'Africa'")
        africa_df["iso3"] = cc.pandas_convert(africa_df["entity_name"], to="ISO3")
        return africa_df[["iso3", "population"]]

    @staticmethod
    def assert_iso3_code_alignment(df1: pd.DataFrame, df2: pd.DataFrame) -> bool:
        set1 = set(df1["iso3"].unique()) - {"ALL"}
        set2 = set(df2["iso3"].unique()) - {"ALL"}
        if set1 == set2:
            return True
        only_in_df1 = set1 - set2
        only_in_df2 = set2 - set1
        raise ValueError(
            f"ISO3 code mismatch:\nOnly in df1: {sorted(only_in_df1)}\nOnly in df2: {sorted(only_in_df2)}"
        )

    def add_population_column(self, df: pd.DataFrame) -> pd.DataFrame:
        pop_df = self.get_africa_population_data()
        if not self.assert_iso3_code_alignment(df, pop_df):
            raise ValueError("ISO3 code mismatch between dataframes")
        pop_df_all = pd.DataFrame(
            {"iso3": ["ALL"], "population": [pop_df["population"].sum()]}
        )
        pop_df_complete = pd.concat([pop_df, pop_df_all], ignore_index=True)
        return pd.merge(df, pop_df_complete, on="iso3", how="left")

    @staticmethod
    def build_code_rate_map(json_paths: list[Path]) -> dict:
        # Combine multiple JSON tariff files into a single prefix map
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
        # Compute ETR for individual and aggregate combinations
        variants = [
            {},
            {"sector": "All sectors"},
            {"country": "All countries"},
            {"country": "All countries", "sector": "All sectors"},
        ]
        frames = []
        for overrides in variants:
            df_variant = df.assign(**overrides)
            frames.append(etr.compute_etr_by_group(df_variant))
        final_df = (
            pd.concat(frames, ignore_index=True)
            .rename(columns={"total_exports": "exports"})
            .loc[:, ["country", "sector", "exports", "etr"]]
            .sort_values(["country", "sector"])
            .reset_index(drop=True)
        )
        return final_df
