import * as d3 from 'npm:d3';

export function formatCurrency(value) {
    if (value == null || isNaN(value)) return "N/A";

    const absValue = Math.abs(value);

    if (absValue >= 1e8) {
        return `$${d3.format(",.1f")(value / 1e9)} B`;
    } else if (absValue >= 1e5) {
        return `$${d3.format(",.1f")(value / 1e6)} M`;
    } else {
        return `$${d3.format(",.0f")(value)}`;
    }
}

export function formatPercentage(value, round = true) {
    if (value == null || typeof value !== 'number' || isNaN(value)) return "N/A";

    const pct = round
        ? Math.round(value)
        : Number.parseFloat(value.toPrecision(1));

    return `${pct}%`;
}

export function formatTariff(value) {
    if (value == null || typeof value !== 'number' || isNaN(value)) return null;
    return Math.round(value * 100);
}

export function computeImpactUSD(exports, tariff) {
    if (exports == null || tariff == null || isNaN(exports) || isNaN(tariff)) return null;
    return exports * tariff;
}

export function computeImpactPCT(exports, tariff, gdp) {
    if (
        exports == null || tariff == null || gdp == null ||
        isNaN(exports) || isNaN(tariff) || isNaN(gdp) ||
        gdp === 0
    ) return null;

    return (exports * tariff) / gdp;
}
