import * as React from "npm:react";
import * as d3 from "npm:d3";
import { ColumnPlot } from "./ColumnPlot.js";
import { LinePlot} from "./LinePlot.js";
import { formatPercentage, formatCurrency } from "../js/format.js";
import { colorPalette } from "../js/colorPalette.js";
import { riskThresholds } from "../js/riskThresholds.js";
import {TariffButtons} from "./TariffButtons.js";

const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.low, colorPalette.medium, colorPalette.high]
);

export function SelectionCard({ data, historicalData, mode, selectedTariff, selectedIndividualTariff, setSelectedIndividualTariff }) {

    let allData, topItems, allHistoricalData;
    const isCountryMode = mode === "country";

    const isAll = d => isCountryMode ? d.product === "All products" : d.country === "All countries";
    const isDetail = d => isCountryMode ? d.product !== "All products" : d.country !== "All countries";
    const isHistorical = d => isCountryMode ? d.product === "All products" : d.country === "All countries";

    allData = data.find(isAll);

    topItems = data
        .filter(d => isDetail(d) && Number.isFinite(d.impact_usd))
        .sort((a, b) => b.impact_usd - a.impact_usd)
        .slice(0, 5);

    allHistoricalData = historicalData.filter(isHistorical);

    const title = mode === "country" ? allData.country : allData.product;

    return (
        <div className="selection-card tariff-card">

            {
                isCountryMode ? (
                    <div className={"selection-card-swatch-plus-icon"}>
                        <div
                            className="swatch"
                            style={{
                                backgroundColor:
                                    allData.etr != null
                                        ? colorScale(allData.etr)
                                        : colorPalette.na,
                            }}
                        >
                            <span
                                className="text-swatch"
                                style={{
                                    color: allData.etr != null ? "white" : "black",
                                }}
                            >
                                {allData.etr != null
                                    ? `ETR: ${allData.etr}%`
                                    : "No data"}
                            </span>
                        </div>
                        <span
                            className={`flag-icon fi fi-${allData.iso2.toLowerCase()} fis`}
                        ></span>
                    </div>
                ) : null
            }

            <div className="selection-card-header">
                <h2 className="text-heading">{title}</h2>
            </div>

            <div className="selection-card-settings">
                <div className="selection-card-settings-partner">
                    <h4 className="text-support-medium">Trade partner</h4>
                    <div className="tariff-button text-support-small selected">US</div>
                </div>
                <div className="selection-card-settings-tariff">
                    <h4 className="text-support-medium">Individual tariff</h4>
                    <TariffButtons
                        selectedTariff={selectedTariff}
                        selectedIndividualTariff={selectedIndividualTariff}
                        setSelectedIndividualTariff={setSelectedIndividualTariff}
                    />
                </div>
            </div>

            <div className="selection-card-row-with-columns">
                <div className="selection-card-row-left-column">
                <h4 className="text-support-medium">Total exposure</h4>
                    <p className="text-impact-large">
                        {formatCurrency(allData.impact_usd)}
                    </p>
                </div>
                <LinePlot
                    data={allHistoricalData}
                />
            </div>

            {
                isCountryMode ? (
                    <div className="selection-card-row">
                        <h4 className="text-support-medium">% of GDP</h4>
                        <p className="text-impact-large">
                            {formatPercentage(allData.impact_pct)}
                        </p>
                    </div>
                ) : null
            }

            <ColumnPlot
                data={topItems}
                mode={mode}
            />
        </div>
    );
}
