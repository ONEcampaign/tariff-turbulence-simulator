// Currency and percentage formatting helpers
import * as d3 from 'npm:d3';

export function formatCurrency(value, {short = true, perPerson = false} = {}) {
    if (value == null || isNaN(value)) return "N/A";

    if (perPerson) {
        if (value < 0.01) {
            return `$${d3.format(",.3f")(value)}`;
        } else if (value < 0.1) {
            return `$${d3.format(",.2f")(value)}`;
        } else {
            return `$${d3.format(",.1f")(value)}`;
        }
    }

    const absValue = Math.abs(value);

    if (absValue >= 1e8) {
        const suffix = short ? "B" : "billion";
        return `$${d3.format(",.1f")(value / 1e9)} ${suffix}`;
    } else if (absValue >= 1e5) {
        const suffix = short ? "M" : "million";
        return `$${d3.format(",.1f")(value / 1e6)} ${suffix}`;
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

export function computeImpactPerPerson(exports, tariff, population) {
    if (
        exports == null || tariff == null || population == null ||
        isNaN(exports) || isNaN(tariff) || isNaN(population) ||
        population === 0
    ) return null;

    return (exports * tariff) / population;
}

export function possessive(name) {
    return `${name}'s`;
}