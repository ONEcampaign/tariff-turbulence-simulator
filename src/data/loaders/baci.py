"""Load and clean historical trade data from the BACI database.

Trade values are deflated to constant BASE_YEAR USD using each exporter's IMF
GDP deflator (via pydeflate), matching the methodology in trade_data_explorer.
The deflated cache is stored at PATHS.EXPORTS_HIST_CONST.
"""

import pandas as pd
from bblocks.data_importers import BACI

from src.data.config import PATHS
from src.data.helpers import (
    add_sector_group_column,
    deflate_to_constant_usd,
    filter_african_countries,
    group_data,
)


class BaciLoader:
    """Loader for historical BACI trade data (constant BASE_YEAR USD)."""

    def load(self) -> pd.DataFrame:
        """Load or download BACI data, deflate to constant USD, and cache.

        On first call the full pipeline runs:
          1. Download HS02 BACI bilateral data.
          2. Filter to US imports.
          3. Map each product to a sector group (dropping unmapped codes).
          4. Sum to (year, exporter, sector) granularity.
          5. Filter to African exporters.
          6. Deflate values to constant BASE_YEAR USD using each country's
             IMF GDP deflator.
          7. Cache the result to PATHS.EXPORTS_HIST_CONST.

        Subsequent calls read the cached CSV directly.
        """
        if PATHS.EXPORTS_HIST.exists():
            df = pd.read_csv(PATHS.EXPORTS_HIST)
        else:
            baci = BACI()
            raw_df = baci.get_data(hs_version="HS02", include_country_labels=True)
            # Keep US imports only
            df = raw_df.query("importer_iso3_code == 'USA'").copy()
            # Map products to sector groups (drops unmapped rows)
            df = add_sector_group_column(df)
            # Aggregate to (year, exporter, sector) before deflating for efficiency
            df = group_data(df, ["year", "exporter_iso3_code", "sector"])
            # Filter to African countries (adds "country" display column)
            df = filter_african_countries(df, "exporter_iso3_code")
            # Deflate to constant BASE_YEAR USD using each exporter's IMF deflator
            df = deflate_to_constant_usd(df, id_column="exporter_iso3_code")
            df.to_csv(PATHS.EXPORTS_HIST_CONST, index=False)
        return df

    @staticmethod
    def clean_df(df: pd.DataFrame) -> pd.DataFrame:
        """Rename columns and keep the minimal set needed downstream."""
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
        """Append an aggregated row representing all African countries."""
        df_all = group_data(df, ["year", "sector"])
        df_all["iso3"] = "ALL"
        df_all["country"] = "All countries"
        return pd.concat([df, df_all])

    @staticmethod
    def add_all_sectors(df: pd.DataFrame) -> pd.DataFrame:
        """Append an aggregated row representing all product sectors."""
        df_all = group_data(df, ["year", "iso3", "country"])
        df_all["sector"] = "All sectors"
        return pd.concat([df, df_all])
