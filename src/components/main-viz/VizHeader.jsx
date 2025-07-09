// Title, subtitle and legend for the map visualisation.
import * as React from "npm:react";
import * as d3 from "npm:d3";
import { colorPalette } from "../../js/colorPalette.js";
import { riskThresholds } from "../../js/riskThresholds.js";

// Match your color scale thresholds
const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.veryLow, colorPalette.low, colorPalette.medium, colorPalette.high]
);

const legendItems = [
    { label: `<${riskThresholds[0]}%`, color: colorPalette.veryLow },
    { label: `${riskThresholds[0]}-${riskThresholds[1]-1}%`, color: colorPalette.low },
    { label: `${riskThresholds[1]}-${riskThresholds[2]-1}%`, color: colorPalette.medium },
    { label: `>${riskThresholds[2]-1}%`, color: colorPalette.high },
    { label: "No data", color: colorPalette.na }
];

export function VizHeader({ title, subtitle} = {}) {
    return (
        <div className="viz-header-wrapper">
            <h3 className="viz-title text-impact-medium">{title}</h3>
            <h4 className="viz-subtitle text-support-xlarge">{subtitle}</h4>
            <div className="legend-wrapper">
                {legendItems.map(({ label, color }) => (
                    <div className="legend-item" key={label}>
                        <div
                            className={`legend-swatch ${label === "No data" ? "hatch-fill" : ""}`}
                            style={{backgroundColor: color}}
                        />
                        <p className="text-support-medium center-aligned">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
