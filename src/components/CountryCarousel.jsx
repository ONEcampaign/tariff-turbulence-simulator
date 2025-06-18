import * as React from "npm:react";
import * as d3 from 'npm:d3';
import {colorPalette} from "../js/colorPalette.js";
import {riskThresholds} from "../js/riskThresholds.js";
import {formatPercentage, formatCurrency} from "../js/format.js";
import {TariffButtons} from "./TariffButtons.js";

const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.low, colorPalette.medium, colorPalette.high]
);

export function CountryCarousel({data, selectedTariff, selectedIndividualTariff, setSelectedIndividualTariff, selectedUnits = "usd"}) {
    const sortKey = selectedUnits === "usd" ? "impact_usd" : "impact_pct";
    const cleaned = data.filter(
        (d) =>
            typeof d[sortKey] === "number" &&
            Number.isFinite(d[sortKey]) &&
            !isNaN(d[sortKey])
    );
    const sorted = [...cleaned].sort((a, b) => b[sortKey] - a[sortKey]);

    return (
        <div className="carousel-container">
            <div className="carousel-track">
                {sorted.map((countryData, index) => (
                    <div className="carousel-card" key={countryData.iso2 || index}>
                        <div
                            className="carousel-card-swatch"
                            style={{
                                backgroundColor:
                                    countryData.etr != null ? colorScale(countryData.etr) : colorPalette.na
                            }}
                        >
                            <span
                                className="carousel-card-swatch-text"
                                style={{
                                    color: countryData.etr != null ? "white" : "black"
                                }}
                            >
                                {countryData.etr != null ? `ETR: ${countryData.etr}%` : "No data"}
                            </span>
                        </div>
                        <div className="carousel-card-header">
                            <h3 className="carousel-card-country-name">{countryData.country}</h3>
                            <span className={`fi fi-${countryData.iso2.toLowerCase()} fis`}></span>
                        </div>
                        <div className="carousel-card-row">
                            <h4 className="carousel-card-var-name">Total exposure</h4>
                            <p className="carousel-card-var-value">{formatCurrency(countryData.impact_usd)}</p>
                        </div>
                        <div className="carousel-card-row">
                            <h4 className="carousel-card-var-name">% of GDP</h4>
                            <p className="carousel-card-var-value">{formatPercentage(countryData.impact_pct)}</p>
                        </div>
                        <div className="carousel-card-settings-partner">
                            <p>Trade partner</p>
                            <span>US</span>
                        </div>
                        <div className="carousel-card-settings-tariff">
                            <p>Individual tariff</p>
                            <TariffButtons
                                selectedTariff={selectedTariff}
                                selectedIndividualTariff={selectedIndividualTariff}
                                setSelectedIndividualTariff={setSelectedIndividualTariff}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <p className="carousel-scroll-message">Scroll to the right to view more countries →</p>
        </div>
    );
}


