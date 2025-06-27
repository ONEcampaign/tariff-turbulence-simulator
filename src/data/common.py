import json
import pandas as pd

from pathlib import Path

from src.data.config import PATHS

def load_json(filepath: Path) -> dict:
    """Load a JSON file from a given path."""
    with open(filepath, "r") as f:
        return json.load(f)

def add_sector_group_column(df: pd.DataFrame) -> pd.DataFrame:
    """Assign each product_code to a product group, dropping unmapped rows."""
    sector_group_map = load_json(PATHS.HS_GROUPS)

    prefix_to_group = {
        prefix: group
        for group, prefix_list in sector_group_map.items()
        for prefix in prefix_list
    }

    def map_sector_group(code):
        code_str = str(code).zfill(2)
        prefix = code_str[:2]
        return prefix_to_group.get(prefix)

    df = df.copy()
    df["sector"] = df["product_code"].apply(map_sector_group)
    return df[df["sector"].notna()].reset_index(drop=True)

def scale_values(df: pd.DataFrame, scale_column: str, value_column: str, output_column: str =None) -> pd.DataFrame:
    """
    Scales values in `value_column` based on multipliers specified in `scale_column`.
    """
    scale_map = {
        "Millions": 1_000_000,
        "Billions": 1_000_000_000
    }

    factor = df[scale_column].map(scale_map).fillna(1)
    result_col = output_column or value_column
    df[result_col] = df[value_column] * factor

    return df