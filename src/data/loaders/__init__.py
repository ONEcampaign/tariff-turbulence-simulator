"""Convenience imports for the data loaders used in CLI scripts."""

__all__ = ["BaciLoader", "UStradeLoader"]


def __getattr__(name: str):
    if name == "BaciLoader":
        from .baci import BaciLoader
        return BaciLoader
    if name == "UStradeLoader":
        from .ustrade import UStradeLoader
        return UStradeLoader
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
