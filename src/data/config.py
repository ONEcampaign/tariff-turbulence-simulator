"""Centralised paths used throughout the data loaders.

This module exposes a ``PATHS`` class with directories to input files.
Loaders in :mod:`src.data.loaders` rely on these paths to locate raw
trade files and tariff definitions.
"""

from pathlib import Path


class PATHS:
    """Collection of project data locations."""

    SRC = Path(__file__).resolve().parent.parent

    DATA = SRC / "data"

    INPUTS = DATA / "inputs"

    EXPORTS_HIST = INPUTS / "africa_exports_to_us_2002_2023_baci_raw.csv"
    HS_GROUPS = INPUTS / "hs_groups.json"

    TARIFFS = INPUTS / "tariffs"

    STEEL = TARIFFS / "steel_products_03_05_2025.json"
    ALUMINUM = TARIFFS / "aluminum_products_03_05_2025.json"
    AUTOS = TARIFFS / "autos_autoparts_04_03_2025.json"
    EXEMPTIONS_1 = TARIFFS / "original_exemptions_04_02_2025.json"
    EXEMPTIONS_2 = TARIFFS / "additional_exemptions_04_11_2025.json"
