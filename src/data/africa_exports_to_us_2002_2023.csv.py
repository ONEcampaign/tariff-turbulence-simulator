import sys

import pandas as pd
from bblocks.data_importers import BACI
from bblocks import places

from src.data.config import PATHS

def get_trade_data() -> pd.DataFrame:

    if PATHS.EXPORTS_HIST.exists():
        return pd.read_csv(PATHS.EXPORTS_HIST)
    else:
        baci = BACI()
        raw_df = baci.get_data(
            hs_version="HS02",
            incl_country_labels=True
        )

        df = raw_df.query("importer_iso3_code == 'USA'")
        df = group_baci_data(df)
        df = filter_african_countries(df)

        df.to_csv(PATHS.EXPORTS_HIST, index=False)

        return df

def group_baci_data(df: pd.DataFrame) -> pd.DataFrame:

    grouped_df = (
        df.groupby(
            [
                "year",
                "exporter_iso3_code",
            ],
            observed=True,
            dropna=False
        )["value"]
        .sum()
        .reset_index()
    )

    return grouped_df

def filter_african_countries(df: pd.DataFrame) -> pd.DataFrame:

    df_clean = df[~df["exporter_iso3_code"].str.contains(r"\d", regex=True)]

    df_clean["region"] = places.resolve_places(df_clean["exporter_iso3_code"], to_type="region", not_found="ignore")

    df_africa = df_clean.query("region == 'Africa'")
    df_africa["country"] = places.resolve_places(df_africa["exporter_iso3_code"], to_type="name_short", not_found="ignore")

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
        "value": "value",
    }

    df = df.rename(columns=cols_dict)[cols_dict.values()]

    return df

if __name__ == "__main__":
    df = get_trade_data()
    df = clean_df(df)
    df.to_csv(sys.stdout, index=False)

