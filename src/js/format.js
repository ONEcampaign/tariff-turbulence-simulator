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

export function formatPercentage(value, { tariff = true, display = true } = {}) {
    if (value == null || typeof value !== 'number' || isNaN(value)) {
        return display ? "N/A" : null;
    }

    const scaled = tariff ? value * 100 : value;

    if (display && tariff && scaled > 0 && scaled < 0.5) {
        return "<1%";
    }

    const formatted = display
        ? (tariff
            ? Math.round(scaled)
            : Number.parseFloat(scaled.toPrecision(1)))
        : scaled;

    return display ? `${formatted}%` : formatted;
}

export function computeImpactUSD(exports, tariff) {
    if (exports == null || tariff == null || isNaN(exports) || isNaN(tariff)) return null;
    return exports * tariff;
}

export function computeImpactPCT(exports, tariff, total_exports) {
    if (
        exports == null || tariff == null || total_exports == null ||
        isNaN(exports) || isNaN(tariff) || isNaN(total_exports) ||
        total_exports === 0
    ) return null;

    return (exports * tariff) / total_exports;
}
