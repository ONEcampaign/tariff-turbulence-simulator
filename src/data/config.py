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

    # Raw BACI cache
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

    # Section 232 timber/lumber (Proclamation 10976, effective October 14, 2025).
    # Softwood: 10% (all countries). Furniture/cabinets: 25% (excl. UK/EU/Japan — those
    # capped at 10%/15% respectively, but all African countries face the full rate).
    # NOTE: hardwood timber (main African export) is NOT in scope until the Oct 2026 review.
    TIMBER_SOFTWOOD = TARIFFS / "timber_softwood_10_14_2025.json"
    TIMBER_FURNITURE = TARIFFS / "timber_furniture_cabinets_10_14_2025.json"

    # Section 122 exemptions (Proclamation 11012, Feb 24, 2026) — supersedes IEEPA EO 14257.
    EXEMPTIONS_S122 = TARIFFS / "exemptions_02_24_2026_section122.json"

    # Section 232 derivative steel/aluminum transitional rate (Proclamation 11021 Annex III).
    # Effective April 6, 2026 through December 31, 2027; then moves to Annex I-B (25%).
    # Rate modelled as 0.15 (15% total): for column-1 duty < 15%, S232 add-on = 15% - col1.
    # Covers industrial machinery, metal processing, large transformers, and misc equipment.
    ANNEX_III_SAC = TARIFFS / "steel_aluminum_derivatives_annex_iii_04_02_2026.json"

    # Section 232 patented pharmaceuticals and APIs (Proclamation 11020, April 2, 2026).
    # Annex I codes: 100% for all African countries (EU/Japan/KR/CH: 15%; UK: 10%).
    # Annex IV codes (exceptions field): zero rate under Section 232; also exempt from S122.
    # Effective July 31, 2026 (Annex III companies) / September 29, 2026 (all others).
    PHARMA_PATENTED = TARIFFS / "pharma_patented_07_31_2026.json"

    COUNTRY_RATES = TARIFFS / "country_specific_tariffs.json"
