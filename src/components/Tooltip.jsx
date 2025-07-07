import * as d3 from "npm:d3";
import { colorPalette } from "../js/colorPalette.js";
import { riskThresholds } from "../js/riskThresholds.js";
import { formatPercentage, formatCurrency } from "../js/format.js";

const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.veryLow, colorPalette.low, colorPalette.medium, colorPalette.high]
);

export function Tooltip({ x, y, data, isVisible } ={}) {
    if (!isVisible) return (<div></div>);

    return (
        <div
            className="tariff-card tooltip"
            style={{"left": x, "top": y}}>
            <div
                className={`swatch ${data.etr === null ? "na" : ""} ${formatPercentage(data.etr, {display: false}) < riskThresholds[0] ? "very-low" : ""} ${formatPercentage(data.etr, {display: false}) < riskThresholds[1] ? "low" : ""}`}
                style={{
                    backgroundColor:
                        data.etr != null ? colorScale(formatPercentage(data.etr, {display: false})) : colorPalette.na
                }}
            >
                <p className="text-swatch">
                    {data.etr != null ? `ETR: ${formatPercentage(data.etr, {})}` : "No data"}
                </p>
            </div>
            <div className="card-header tooltip-header">
                <h3 className="text-heading">{data.country}</h3>
                <div className="flag-icon-container">
                    <img
                        className="flag-icon"
                        src={`https://cdn.jsdelivr.net/npm/flag-icons/flags/1x1/${data.iso2.toLowerCase()}.svg`}
                        alt={`${data.country} flag`}
                        crossOrigin="anonymous"
                    />
                </div>
            </div>
            <div className="card-row tooltip-row">
                <h4 className="tooltip-var-name text-support-small">Total cost</h4>
                <p className="text-impact-medium">{formatCurrency(data.impact_usd)}</p>
            </div>
            <div className="card-row tooltip-row">
                <h4 className="tooltip-var-name text-support-small">Cost per capita</h4>
                <p className="text-impact-medium">{formatCurrency(data.impact_pc, {perCapita: true})}</p>
            </div>
        </div>
    )
}