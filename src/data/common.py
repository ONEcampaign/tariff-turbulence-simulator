import json
import pandas as pd

from pathlib import Path

from src.data.config import PATHS

def load_json(filepath: Path) -> dict:
    """Load a JSON file from a given path."""
    with open(filepath, "r") as f:
        return json.load(f)

def add_product_group_column(df: pd.DataFrame) -> pd.DataFrame:
    """Assign each product_code to a product group, dropping unmapped rows."""
    product_group_map = load_json(PATHS.HS_GROUPS)

    prefix_to_group = {
        prefix: group
        for group, prefix_list in product_group_map.items()
        for prefix in prefix_list
    }

    def map_product_group(code):
        code_str = str(code).zfill(2)
        prefix = code_str[:2]
        return prefix_to_group.get(prefix)

    df = df.copy()
    df["product"] = df["product_code"].apply(map_product_group)
    return df[df["product"].notna()].reset_index(drop=True)