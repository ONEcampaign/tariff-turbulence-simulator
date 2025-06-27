import * as React from "npm:react";
import * as d3 from "npm:d3";
import { ColumnPlot } from "./ColumnPlot.js";
import { LinePlot} from "./LinePlot.js";
import {formatPercentage, formatCurrency, formatTariff} from "../js/format.js";
import { colorPalette } from "../js/colorPalette.js";
import { riskThresholds } from "../js/riskThresholds.js";
import {TariffButtons} from "./TariffButtons.js";

const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.low, colorPalette.medium, colorPalette.high]
);

export function SelectionCard({
    data, historicalData, mode,
    selectedTariff, selectedIndividualTariff, setSelectedIndividualTariff,
    showMore, setShowMore
}) {

    let allData, allItems, allHistoricalData;
    const isCountryMode = mode === "country";

    const isAll = d => isCountryMode ? d.product === "All products" : d.country === "All countries";
    const isDetail = d => isCountryMode ? d.product !== "All products" : d.country !== "All countries";
    const isHistorical = d => isCountryMode ? d.product === "All products" : d.country === "All countries";
    const showMoreText = isCountryMode ? "sectors" : "countries"

    const chunkSize = 5;

    allData = data.find(isAll);

    allItems = data
        .filter(d => isDetail(d) && Number.isFinite(d.impact_usd))
        .sort((a, b) => b.impact_usd - a.impact_usd);

    allHistoricalData = historicalData.filter(isHistorical);

    const title = mode === "country" ? allData.country : allData.product;

    return (
        <div className="tariff-card selection-card">

            {
                isCountryMode ? (
                    <div className={"card-header selection-card-header"}>
                        <div
                            className={`swatch ${allData.etr === null ? "na" : ""} ${formatTariff(allData.etr) < riskThresholds[0] ? "light" : ""}`}
                            style={{
                                backgroundColor:
                                    allData.etr != null
                                        ? colorScale(formatTariff(allData.etr))
                                        : colorPalette.na,
                            }}
                        >
                            <p className="text-swatch">
                                {allData.etr != null
                                    ? `ETR: ${formatPercentage(formatTariff(allData.etr))}`
                                    : "No data"}
                            </p>
                        </div>
                        <span
                            className={`flag-icon fi fi-${allData.iso2.toLowerCase()} fis`}
                        ></span>
                    </div>
                ) : null
            }

            <div className="card-header selection-card-header">
                <h3 className="text-heading">{title}</h3>
            </div>

            <div className="selection-card-settings">
                <div className="card-row selection-card-row">
                    <h4 className="text-support-medium">Trade partner</h4>
                    <div className="swatch us-swatch">
                        <p className="text-swatch">US</p>
                    </div>
                </div>
                <div className="card-row selection-card-row">
                    <h4 className="text-support-medium">Individual tariff</h4>
                    <TariffButtons
                        selectedTariff={selectedTariff}
                        selectedIndividualTariff={selectedIndividualTariff}
                        setSelectedIndividualTariff={setSelectedIndividualTariff}
                    />
                </div>
            </div>

            <div className="card-row selection-card-row-container">
                <div className="card-row selection-card-row">
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
                    <div className="card-row selection-card-row">
                        <h4 className="text-support-medium">% of GDP</h4>
                        <p className="text-impact-large">
                            {formatPercentage(allData.impact_pct, false)}
                        </p>
                    </div>
                ) : null
            }

            <ColumnPlot
                data={allItems}
                mode={mode}
                showMore={showMore}
                chunkSize={chunkSize}
            />

            {
                (allItems.length > chunkSize) ? (
                    <div
                        className='dropdown-selected show-more-button'
                        onClick={() => {setShowMore(!showMore)}}
                    >
                        <p className="text-inputs">{`Show ${showMore === true ? 'less' : 'more'} ${showMoreText}`}</p>
                        <ChevronDown className={`dropdown-chevron ${showMore === true ? "rotate" : ""}`} />
                    </div>
                ) : null
            }
        </div>
    );
}

const ChevronDown = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        strokeWidth="2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    >
        <path d="M2 5l6 6 6-6" />
    </svg>
);
