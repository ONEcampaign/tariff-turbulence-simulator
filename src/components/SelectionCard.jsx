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
        <div className="single-country-card">

            {
                isCountryMode ? (
                    <div className={"single-country-card-swatch-plus-icon"}>
                        <div
                            className="single-country-card-swatch"
                            style={{
                                backgroundColor:
                                    allData.etr != null
                                        ? colorScale(allData.etr)
                                        : colorPalette.na,
                            }}
                        >
                        <span
                            className="single-country-card-swatch-text"
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
                            className={`fi fi-${allData.iso2.toLowerCase()} fis`}
                        ></span>
                    </div>
                ) : null
            }

            <div className="single-country-card-header">
                <h3>{title}</h3>
            </div>

            <div className="single-country-card-settings">
                <div className="single-country-card-settings-partner">
                    <p>Trade partner</p>
                    <span>US</span>
                </div>
                <div className="single-country-card-settings-tariff">
                    <p>Individual tariff</p>
                    <TariffButtons
                        selectedTariff={selectedTariff}
                        selectedIndividualTariff={selectedIndividualTariff}
                        setSelectedIndividualTariff={setSelectedIndividualTariff}
                    />
                </div>
            </div>

            <div className="single-country-card-row-with-columns">
                <div className="single-country-card-row-left-column">
                <h4 className="single-country-card-var-name">Total exposure</h4>
                    <p className="single-country-card-var-value">
                        {formatCurrency(allData.impact_usd)}
                    </p>
                </div>
                <LinePlot
                    data={allHistoricalData}
                />
            </div>

            {
                isCountryMode ? (
                    <div className="single-country-card-row">
                        <h4 className="single-country-card-var-name">% of GDP</h4>
                        <p className="single-country-card-var-value">
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
