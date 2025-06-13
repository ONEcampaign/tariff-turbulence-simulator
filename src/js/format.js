import * as d3 from 'npm:d3';

export function formatCurrency(value) {
    const absValue = Math.abs(value);

    if (absValue >= 1e8) {
        return `$${d3.format(",.1f")(value / 1e9)} B`;
    } else if (absValue >= 1e5) {
        return `$${d3.format(",.1f")(value / 1e6)} M`;
    } else {
        return `$${d3.format(",.1f")(value)}`;
    }
};