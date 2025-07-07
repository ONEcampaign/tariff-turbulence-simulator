import * as React from "npm:react";
import * as d3 from "npm:d3";
import { ColumnPlot } from "./ColumnPlot.js";
import { LinePlot} from "./LinePlot.js";
import {formatPercentage, formatCurrency} from "../js/format.js";
import { colorPalette } from "../js/colorPalette.js";
import { riskThresholds } from "../js/riskThresholds.js";
import {TariffPills} from "./TariffPills.js";
import {ChevronDown} from "./ChevronDown.js";
import {DownloadShareButtons} from "./DownloadShareButtons.js";

const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.veryLow, colorPalette.low, colorPalette.medium, colorPalette.high]
);

export function SelectionCard(
    {
        data,
        historicalData,
        mode,
        selectedTariff,
        isETR,
        showMore,
        setShowMore
}) {

    let allData, allItems, allHistoricalData;
    const isCountryMode = mode === "country";

    const isAll = d => isCountryMode ? d.sector === "All sectors" : d.country === "All countries";
    const isDetail = d => isCountryMode ? d.sector !== "All sectors" : d.country !== "All countries";
    const isHistorical = d => isCountryMode ? d.sector === "All sectors" : d.country === "All countries";
    const showMoreText = isCountryMode ? "sectors" : "countries"

    const chunkSize = 5;

    allData = data.find(isAll);

    allItems = data
        .filter(d => isDetail(d) && Number.isFinite(d.impact_usd))
        .sort((a, b) => b.impact_usd - a.impact_usd);

    allHistoricalData = historicalData.filter(isHistorical);

    const title = isCountryMode ? allData.country : allData.sector;

    const idString = title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/&/g, "");

    return (
        <div className="tariff-card selection-card" id={`section-card-${idString}`}>

            {
                isCountryMode ? (
                    <div className={"card-header selection-card-header"}>
                        <div
                            className={`swatch ${allData.etr === null ? "na" : ""} ${formatPercentage(allData.etr, {display: false}) < riskThresholds[0] ? "very-low" : ""} ${formatPercentage(allData.etr, {display: false}) < riskThresholds[1] ? "low" : ""}`}
                            style={{
                                backgroundColor:
                                    allData.etr != null
                                        ? colorScale(formatPercentage(allData.etr, {display: false}))
                                        : colorPalette.na,
                            }}
                        >
                            <p className="text-swatch">
                                {allData.etr != null
                                    ? `ETR: ${formatPercentage(allData.etr, {})}`
                                    : "No data"}
                            </p>
                        </div>

                        <div className="flag-icon-container">
                            <img
                                className="flag-icon"
                                src={`https://cdn.jsdelivr.net/npm/flag-icons/flags/1x1/${allData.iso2.toLowerCase()}.svg`}
                                alt={`${allData.country} flag`}
                                crossOrigin="anonymous"
                            />
                        </div>
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
                    <TariffPills
                        isETR={isETR}
                        selectedTariff={selectedTariff}
                    />
                </div>
            </div>

            <div className="card-row selection-card-row-container">
                <div className="card-row selection-card-row">
                    <h4 className="text-support-medium">Total cost</h4>
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
                        <h4 className="text-support-medium">Cost per capita</h4>
                        <p className="text-impact-large">
                            {formatCurrency(allData.impact_pc, {perCapita: true})}
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

            <div className="selection-card-footer">
                {
                    (allItems.length > chunkSize) ? (
                        <div
                            className="dropdown-selected show-more-button"
                            onClick={() => {setShowMore(!showMore)}}
                        >
                            <p className="text-inputs">{`Show ${showMore === true ? "less" : "more"} ${showMoreText}`}</p>
                            <ChevronDown className={`dropdown-chevron ${showMore === true ? "rotate" : ""}`} />
                        </div>
                    ) : null
                }
                <DownloadShareButtons
                    targetId={`section-card-${idString}`}
                    selectedCountry={allData.country}
                    selectedCountryISO3={allData.iso3}
                    selectedSector={allData.sector}
                    selectedTariff={selectedTariff}
                    isETR={isETR}
                />
            </div>
        </div>
    );
}
