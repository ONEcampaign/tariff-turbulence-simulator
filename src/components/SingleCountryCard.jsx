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

export function SingleCountryCard({ data, historicalData, selectedTariff, selectedIndividualTariff, setSelectedIndividualTariff }) {

    console.log(historicalData);

    const allProductsData = data.find((d) => d.product === "All products");

    const topProducts = data
        .filter((d) => d.product !== "All products" && Number.isFinite(d.impact_usd))
        .sort((a, b) => b.impact_usd - a.impact_usd)
        .slice(0, 5);

    return (
        <div className="single-country-card">
            <div className="single-country-card-swatch-plus-icon">
                <div
                    className="single-country-card-swatch"
                    style={{
                        backgroundColor:
                            allProductsData.etr != null
                                ? colorScale(allProductsData.etr)
                                : colorPalette.na,
                    }}
                >
          <span
              className="single-country-card-swatch-text"
              style={{
                  color: allProductsData.etr != null ? "white" : "black",
              }}
          >
            {allProductsData.etr != null
                ? `ETR: ${allProductsData.etr}%`
                : "No data"}
          </span>
                </div>
                <span
                    className={`fi fi-${allProductsData.iso2.toLowerCase()} fis`}
                ></span>
            </div>

            <div className="single-country-card-header">
                <h3 className="single-country-card-country-name">
                    {allProductsData.country}
                </h3>
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
                        {formatCurrency(allProductsData.impact_usd)}
                    </p>
                </div>
                <LinePlot
                    data={historicalData}
                />
            </div>

            <div className="single-country-card-row">
                <h4 className="single-country-card-var-name">% of GDP</h4>
                <p className="single-country-card-var-value">
                    {formatPercentage(allProductsData.impact_pct)}
                </p>
            </div>

            <ColumnPlot data={topProducts}/>
        </div>
    );
}
