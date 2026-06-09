"""Centralized paths used throughout the data loaders."""

from pathlib import Path


class PATHS:
    """Collection of project data locations."""

    SRC = Path(__file__).resolve().parent.parent

    DATA = SRC / "data"

    INPUTS = DATA / "inputs"

    EXPORTS_HIST = INPUTS / "africa_exports_to_us_2002_2024_baci_raw.csv"
    HS_GROUPS = INPUTS / "hs_groups.json"

    TARIFFS = INPUTS / "tariffs"

    STEEL = TARIFFS / "steel_products_03_12_2025.json"
    ALUMINUM = TARIFFS / "aluminum_products_03_12_2025.json"
    COPPER = TARIFFS / "copper_products_08_01_2025.json"
    SAC_DERIVATIVES = TARIFFS / "steel_aluminum_copper_derivatives_04_02_2026.json"

    AUTOS = TARIFFS / "autos_autoparts_04_03_2025.json"
    BUSES = TARIFFS / "buses_11_01_2025.json"
    MHDV = TARIFFS / "mhdv_11_01_2025.json"

    EXEMPTIONS_1 = TARIFFS / "exemptions_04_02_2025.json"
    EXEMPTIONS_2 = TARIFFS / "exemptions_04_11_2025.json"
    EXEMPTIONS_3 = TARIFFS / "exemptions_11_13_2025.json"

    COUNTRY_RATES = TARIFFS / "country_specific_tariffs.json"
