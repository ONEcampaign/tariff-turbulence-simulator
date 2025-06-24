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
                    <div className="tariff-card carousel-card" key={countryData.iso2 || index}>
                        <div
                            className="swatch"
                            style={{
                                backgroundColor:
                                    countryData.etr != null ? colorScale(countryData.etr) : colorPalette.na
                            }}
                        >
                            <span
                                className="text-swatch"
                                style={{
                                    color: countryData.etr != null ? "white" : "black"
                                }}
                            >
                                {countryData.etr != null ? `ETR: ${countryData.etr}%` : "No data"}
                            </span>
                        </div>
                        <div className="card-header carousel-card-header">
                            <h3 className="text-heading">{countryData.country}</h3>
                            <span className={`flag-icon fi fi-${countryData.iso2.toLowerCase()} fis`}></span>
                        </div>
                        <div className="card-row carousel-card-row">
                            <h4 className="text-support-medium">Total exposure</h4>
                            <p className="text-impact-large">{formatCurrency(countryData.impact_usd)}</p>
                        </div>
                        <div className="card-row carousel-card-row">
                            <h4 className="text-support-medium">% of GDP</h4>
                            <p className="text-impact-large">{formatPercentage(countryData.impact_pct)}</p>
                        </div>
                        <div className="card-row carousel-card-settings">
                            <h4 className="text-support-medium">Trade partner</h4>
                            <div className="tariff-button text-support-small selected">US</div>
                        </div>
                        <div className="card-row carousel-card-settings">
                            <h4 className="text-support-medium">Individual tariff</h4>
                            <TariffButtons
                                selectedTariff={selectedTariff}
                                selectedIndividualTariff={selectedIndividualTariff}
                                setSelectedIndividualTariff={setSelectedIndividualTariff}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <p className="carousel-scroll-message text-support-small">Scroll to the right to view more countries →</p>
        </div>
    );
}


