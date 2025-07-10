"""Export historical BACI trade data into the Framework app."""

import sys
from src.data.loaders import BaciLoader

if __name__ == "__main__":
    loader = BaciLoader()
    df = loader.load()
    df = loader.clean_df(df)
    df = loader.add_all_countries(df)
    df = loader.add_all_sectors(df)
    df.to_csv(sys.stdout, index=False)
