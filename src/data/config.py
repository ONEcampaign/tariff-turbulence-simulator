from pathlib import Path


class PATHS:
    """Class to store the paths to the inputs."""

    SRC = Path(__file__).resolve().parent.parent

    DATA = SRC / "data"
    INPUTS = DATA / "inputs"
    HS_SECTIONS = INPUTS / "hs_sections.json"
