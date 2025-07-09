"""Command line interface to export recent USA Trade data as CSV."""

import sys
from src.data.loaders import UStradeLoader

if __name__ == "__main__":
    loader = UStradeLoader()
    df = loader.load()
    df.to_csv(sys.stdout, index=False)
