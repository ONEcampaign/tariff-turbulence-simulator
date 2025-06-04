import sys

import json
import pandas as pd

from bblocks.data_importers import BACI
import country_converter as coco

from src.data.config import PATHS


def get_baci_data() -> pd.DataFrame:

    baci = BACI(data_path=PATHS.INPUTS)

    return baci.get_data()


def filter_us_africa_trade(df: pd.DataFrame) -> pd.DataFrame:

    cc = coco.CountryConverter()

    df_us = df.query("`importer_iso3` == 'USA'")

    df_us["continent"] = cc.pandas_convert(df_us["exporter_iso3"], to="continent")

    df_us_africa = df_us.query("`continent` == 'Africa'")

    return df_us_africa


def map_hs_sections(df: pd.DataFrame) -> pd.DataFrame:

    with open(PATHS.HS_SECTIONS, "r") as f:
        hs_dict = json.load(f)
    product_code_to_section = {
        code: category for category, codes in hs_dict.items() for code in codes
    }

    df["product"] = df["product_code"].str[:2].map(product_code_to_section)

    return df


def clean_columns(df: pd.DataFrame) -> pd.DataFrame:

    column_mapping = {
        "year": "year",
        "exporter_name": "country",
        "exporter_iso3": "iso3",
        "product": "product",
        "value": "value",
    }

    df = df.rename(columns=column_mapping)[list(column_mapping.values())]

    df['country'] = df['country'].astype("string[python]").str.encode('latin1').str.decode('utf-8')

    return df


def average_value(df: pd.DataFrame, groupby_cols: list) -> pd.DataFrame:

    df = (
        df.groupby(groupby_cols, observed=True, dropna=False)["value"]
        .mean()
        .reset_index()
    )

    return df


def get_us_africa_trade_data() -> pd.DataFrame:

    df = get_baci_data()

    df_us_africa = filter_us_africa_trade(df)

    df_mapped = map_hs_sections(df_us_africa)

    df_clean = clean_columns(df_mapped)

    df_total = average_value(df_clean, ["country", "iso3"])
    df_total["product"] = "All products"

    df_by_product = average_value(df_clean, ["country", "iso3", "product"])

    final_df = pd.concat([df_total, df_by_product]).sort_values(["country", "product"])

    return final_df


if __name__ == "__main__":

    df = get_us_africa_trade_data()

    df.to_csv(sys.stdout, index=False)

    # df.to_csv(PATHS.OUTPUTS / "us_africa_trade.csv", index=False)
