import * as React from "npm:react";
import * as d3 from "npm:d3";
import { colorPalette } from "../js/colorPalette.js";
import { riskThresholds } from "../js/riskThresholds.js";

// Match your color scale thresholds
const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.low, colorPalette.medium, colorPalette.high]
);

const legendItems = [
    { label: `0-${riskThresholds[0]}%`, color: colorPalette.low },
    { label: `${riskThresholds[0]}-${riskThresholds[1]-1}%`, color: colorPalette.medium },
    { label: `+${riskThresholds[1]-1}%`, color: colorPalette.high },
    { label: "No data", color: colorPalette.na }
];

export function Legend({ title, subtitle} = {}) {
    return (
        <div className="legend">
            <h3 className="legend-title text-impact-medium">{title}</h3>
            <h4 className="legend-subtitle text-support-xlarge">{subtitle}</h4>
            <div className="legend-items">
                {legendItems.map(({ label, color }) => (
                    <div className="legend-item" key={label}>
                        <span
                            className="legend-swatch"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-support-medium center-aligned">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
