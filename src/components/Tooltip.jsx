import * as d3 from 'npm:d3';
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
                className={`swatch ${data.etr === null ? "na" : ""} ${formatTariff(data.etr) < riskThresholds[0] ? "very-low" : ""} ${formatTariff(data.etr) < riskThresholds[1] ? "low" : ""}`}
                style={{
                    backgroundColor:
                        data.etr != null ? colorScale(formatPercentage(data.etr), {display: false}) : colorPalette.na
                }}
            >
                <p className="text-swatch">
                    {data.etr != null ? `ETR: ${formatPercentage(data.etr, {})}` : "No data"}
                </p>
            </div>
            <div className="card-header tooltip-header">
                <h3 className="text-heading">{data.country}</h3>
                <span className={`flag-icon fi fi-${data.iso2.toLowerCase()} fis`}></span>
            </div>
            <div className="card-row tooltip-row">
                <h4 className="tooltip-var-name text-support-small">Total exposure</h4>
                <p className="text-impact-medium">{formatCurrency(data.impact_usd)}</p>
            </div>
            <div className="card-row tooltip-row">
                <h4 className="tooltip-var-name text-support-small">% of GDP</h4>
                <p className="text-impact-medium">{formatPercentage(data.impact_pct, {tariff: false})}</p>
            </div>
        </div>
    )
}