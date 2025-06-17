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
                <h3 className="tooltip-country-name">{tooltipData.country}</h3>
                <p className={`fi fi-${tooltipData.iso2.toLowerCase()} fis`}></p>
            </div>
            <div className="tooltip-row">
                <h4 className="tooltip-var-name">Total exposure</h4>
                <p className="tooltip-var-value">{tooltipData.impact_usd}</p>
            </div>
            <div className="tooltip-row">
                <h4 className="tooltip-var-name">% of GDP</h4>
                <p className="tooltip-var-value">{tooltipData.impact_pct}</p>
            </div>
        </div>
    )
}