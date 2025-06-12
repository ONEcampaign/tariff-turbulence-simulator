import * as React from "npm:react";
import * as d3 from "npm:d3";
import {colorPalette} from "./colorPalette.js";

// Match your color scale thresholds
const colorScale = d3.scaleThreshold([5, 15], [
    colorPalette.low,
    colorPalette.medium,
    colorPalette.high
]);

const legendItems = [
    { label: "0–5%", color: colorPalette.low },
    { label: "5–15%", color: colorPalette.medium },
    { label: "+15%", color: colorPalette.high },
    { label: "No data", color: colorPalette.na }
];

export function Legend({ title, subtitle} = {}) {
    return (
        <div className="legend">
            <div className="legend-title">{title}</div>
            <div className="legend-subtitle">{subtitle}</div>
            <div className="legend-items">
                {legendItems.map(({ label, color }) => (
                    <div className="legend-item" key={label}>
            <span
                className="legend-swatch"
                style={{ backgroundColor: color }}
            />
                        <span className="legend-label">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
