"""Centralized paths used throughout the data loaders."""

from pathlib import Path

# Reference year for constant-price deflation (shared by all loaders).
# Matches the base year used in trade_data_explorer.
BASE_YEAR: int = 2024


class PATHS:
    """Collection of project data locations."""

    SRC = Path(__file__).resolve().parent.parent

    DATA = SRC / "data"

    INPUTS = DATA / "inputs"

    # Raw BACI cache (current USD) — kept for backward compatibility.
    EXPORTS_HIST = INPUTS / "africa_exports_to_us_2002_2024_baci_raw.csv"
    # Constant-USD BACI cache (deflated to BASE_YEAR prices).
    EXPORTS_HIST_CONST = INPUTS / "africa_exports_to_us_2002_2024_baci_const2024.csv"
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
