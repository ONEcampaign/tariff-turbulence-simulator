"""Load and clean historical trade data from the BACI database.

This loader feeds preprocessed trade values into the ETR calculations.
It relies on :mod:`src.data.config` for file locations and
:mod:`src.data.helpers` for common data wrangling tasks.
"""

import pandas as pd
from bblocks.data_importers import BACI

from src.data.config import PATHS
from src.data.helpers import (
    add_sector_group_column,
    filter_african_countries,
    group_data,
)


class BaciLoader:
    """Loader for historical BACI trade data."""

    def load(self) -> pd.DataFrame:
        """Load or download trade data."""
        if PATHS.EXPORTS_HIST.exists():
            df = pd.read_csv(PATHS.EXPORTS_HIST)
        else:
            baci = BACI()
            raw_df = baci.get_data(hs_version="HS02", incl_country_labels=True)
            # Keep US imports only and summarise by year/country/sector
            df = raw_df.query("importer_iso3_code == 'USA'")
            df = add_sector_group_column(df)
            df = group_data(df, ["year", "exporter_iso3_code", "sector"])
            df = filter_african_countries(df, "exporter_iso3_code")
            df.to_csv(PATHS.EXPORTS_HIST, index=False)
        return df

    @staticmethod
    def clean_df(df: pd.DataFrame) -> pd.DataFrame:
        cols_dict = {
            "year": "year",
            "exporter_iso3_code": "iso3",
            "country": "country",
            "product": "sector",
            "value": "value",
        }
        return df.rename(columns=cols_dict)[list(cols_dict.values())]

    @staticmethod
    def add_all_countries(df: pd.DataFrame) -> pd.DataFrame:
        df_all = group_data(df, ["year", "sector"])
        df_all["iso3"] = "ALL"
        df_all["country"] = "All countries"
        return pd.concat([df, df_all])

    @staticmethod
    def add_all_sectors(df: pd.DataFrame) -> pd.DataFrame:
        df_all = group_data(df, ["year", "iso3", "country"])
        df_all["sector"] = "All sectors"
        return pd.concat([df, df_all])
