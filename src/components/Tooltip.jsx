import * as d3 from 'npm:d3';
import { colorPalette } from "../js/colorPalette.js";
import { riskThresholds } from "../js/riskThresholds.js";

const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.low, colorPalette.medium, colorPalette.high]
);

export function Tooltip({ x, y, tooltipData, isVisible } ={}) {
    if (!isVisible) return (<div></div>);

    return (
        <div className="tooltip" style={{"left": x, "top": y}}>
            <div
                className="tooltip-swatch"
                style={{
                    backgroundColor:
                        tooltipData.etr != null ? colorScale(tooltipData.etr) : colorPalette.na
                }}
            >
                <span
                    className="tooltip-swatch-text"
                    style={{
                        color: tooltipData.etr != null ? "white" : "black"
                    }}
                >
                    {tooltipData.etr != null ? `ETR: ${tooltipData.etr}%` : "No data"}
                </span>
            </div>
            <div className="tooltip-header">
                <span className="tooltip-country-name">{tooltipData.country}</span>
                <span className="tooltip-flag">[flag]</span>
            </div>
            <div className="tooltip-row">
                <span className="tooltip-var-name">Total exposure</span>
                <span className="tooltip-var-value">{tooltipData.impact_usd}</span>
            </div>
            <div className="tooltip-row">
                <span className="tooltip-var-name">% of GDP</span>
                <span className="tooltip-var-value">{tooltipData.impact_pct}</span>
            </div>
        </div>
    )
}