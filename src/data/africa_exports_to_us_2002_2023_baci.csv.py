import sys

import pandas as pd
from bblocks.data_importers import BACI
import country_converter as coco

from src.data.common import add_sector_group_column
from src.data.config import PATHS

def get_trade_data() -> pd.DataFrame:

    if PATHS.EXPORTS_BACI.exists():
        return pd.read_csv(PATHS.EXPORTS_BACI)
    else:
        baci = BACI()
        raw_df = baci.get_data(
            hs_version="HS02",
            incl_country_labels=True
        )

        df = raw_df.query("importer_iso3_code == 'USA'")
        df = add_sector_group_column(df)
        df = group_data(df, ["year", "exporter_iso3_code", "sector"])
        df = filter_african_countries(df)

        df.to_csv(PATHS.EXPORTS_BACI, index=False)

        return df

def group_data(df: pd.DataFrame, group_cols: list) -> pd.DataFrame:

    grouped_df = (
        df.groupby(
            group_cols,
            observed=True,
            dropna=False
        )["value"]
        .sum()
        .reset_index()
    )

    return grouped_df

def filter_african_countries(df: pd.DataFrame) -> pd.DataFrame:

    cc = coco.CountryConverter()

    df["region"] = cc.pandas_convert(df["exporter_iso3_code"], to="continent")
    df_africa = df.query("region == 'Africa'")
    df_africa["country"] = cc.pandas_convert(df["exporter_iso3_code"], to="name_short")

    territories = [
        'French Southern Territories',
        'British Indian Ocean Territory',
        'Mayotte',
        'St. Helena'
    ]

    df_africa = df_africa.query("country not in @territories")

    return df_africa


def clean_df(df: pd.DataFrame) -> pd.DataFrame:

    cols_dict = {
        "year": "year",
        "exporter_iso3_code": "iso3",
        "country": "country",
        "product": "sector",
        "value": "value",
    }

    df = df.rename(columns=cols_dict)[cols_dict.values()]

    return df

def add_all_countries(df: pd.DataFrame) -> pd.DataFrame:

    df_all = group_data(df, ["year", "sector"])

    df_all["iso3"] = "ALL"
    df_all["country"] = "All countries"

    combined_df = pd.concat([df, df_all])

    return combined_df

def add_all_sectors(df: pd.DataFrame) -> pd.DataFrame:

    df_all = group_data(df, ["year", "iso3", "country"])

    df_all["sector"] = "All sectors"

    combined_df = pd.concat([df, df_all])

    return combined_df

if __name__ == "__main__":
    df = get_trade_data()
    df = clean_df(df)
    df = add_all_countries(df)
    df = add_all_sectors(df)
    df.to_csv(sys.stdout, index=False)

