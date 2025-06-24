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
        <div className="tooltip tariff-card" style={{"left": x, "top": y}}>
            <div
                className="swatch"
                style={{
                    backgroundColor:
                        tooltipData.etr != null ? colorScale(tooltipData.etr) : colorPalette.na
                }}
            >
                <span
                    className="text-swatch"
                    style={{
                        color: tooltipData.etr != null ? "white" : "black"
                    }}
                >
                    {tooltipData.etr != null ? `ETR: ${tooltipData.etr}%` : "No data"}
                </span>
            </div>
            <div className="tooltip-header">
                <h2 className="text-heading">{tooltipData.country}</h2>
                <p className={`flag-icon fi fi-${tooltipData.iso2.toLowerCase()} fis`}></p>
            </div>
            <div className="tooltip-row">
                <h4 className="tooltip-var-name text-support-small">Total exposure</h4>
                <p className="text-impact-medium">{tooltipData.impact_usd}</p>
            </div>
            <div className="tooltip-row">
                <h4 className="tooltip-var-name text-support-small">% of GDP</h4>
                <p className="text-impact-medium">{tooltipData.impact_pct}</p>
            </div>
        </div>
    )
}