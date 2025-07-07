import * as React from "npm:react";
import * as d3 from "npm:d3";
import {colorPalette} from "../js/colorPalette.js";
import {riskThresholds} from "../js/riskThresholds.js";
import {formatPercentage, formatCurrency} from "../js/format.js";
import {TariffPill} from "./TariffPill.js";
import {DownloadShareButtons} from "./DownloadShareButtons.js";

const colorScale = d3.scaleThreshold(
    riskThresholds,
    [colorPalette.veryLow, colorPalette.low, colorPalette.medium, colorPalette.high]
);

export function CountryCarousel(
    {
        data,
        mode,
        isETR,
        selectedTariff,
        selectedUnits = "usd"
    }
    ) {
    const sortKey = selectedUnits === "usd" ? "impact_usd" : "impact_pc";
    const cleaned = data.filter(
        (d) =>
            typeof d[sortKey] === "number" &&
            Number.isFinite(d[sortKey]) &&
            !isNaN(d[sortKey])
    );
    const sorted = [...cleaned].sort((a, b) => b[sortKey] - a[sortKey]);

    const carouselRef = React.useRef(null);

    React.useEffect(() => {
        function updateCarouselWidth() {
            const container = carouselRef.current;
            if (container) {
                const left = container.getBoundingClientRect().left;
                container.style.width = `calc(${window.innerWidth - left}px - 1rem)`;
            }
        }

        updateCarouselWidth(); // Run on mount

        window.addEventListener("resize", updateCarouselWidth); // Re-run on resize
        return () => window.removeEventListener("resize", updateCarouselWidth); // Cleanup
    }, []);

    return (
        <div
            className="carousel-container"
            ref={carouselRef}
        >
            <div className="carousel-track">
                {sorted.map((countryData, index) => {
                    const cardId = `tariff-card-${countryData.iso2?.toLowerCase() || index}`;
                    return (
                        <div
                            className="tariff-card carousel-card"
                            key={cardId}
                            id={cardId}
                        >
                            <div
                                className={`swatch ${countryData.etr === null ? "na" : ""} ${formatPercentage(countryData.etr, {display: false}) < riskThresholds[0] ? "very-low" : ""} ${formatPercentage(countryData.etr, {display: false}) < riskThresholds[1] ? "low" : ""}`}
                                style={{
                                    backgroundColor:
                                        countryData.etr != null ? colorScale(formatPercentage(countryData.etr, {display: false})) : colorPalette.na
                                }}
                            >
                                <p className="text-swatch">
                                    {countryData.etr != null ? `ETR: ${formatPercentage(countryData.etr, {})}` : "No data"}
                                </p>
                            </div>
                            <div className="card-header carousel-card-header">
                                <h3 className="text-heading">{countryData.country}</h3>
                                <div className="flag-icon-container">
                                    <img
                                        className="flag-icon"
                                        src={`https://cdn.jsdelivr.net/npm/flag-icons/flags/1x1/${countryData.iso2.toLowerCase()}.svg`}
                                        alt={`${countryData.country} flag`}
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            </div>
                            <div className="card-row carousel-card-row">
                                <h4 className="text-support-medium">Total cost</h4>
                                <p className="text-impact-large">{formatCurrency(countryData.impact_usd)}</p>
                            </div>
                            <div className="card-row carousel-card-row">
                                <h4 className="text-support-medium">Cost per capita</h4>
                                <p className="text-impact-large">{formatCurrency(countryData.impact_pc, {perCapita: true})}</p>
                            </div>
                            <div className="card-row carousel-card-settings">
                                <h4 className="text-support-medium">Trade partner</h4>
                                <div className="swatch us-swatch">
                                    <p className="text-swatch">US</p>
                                </div>
                            </div>
                            <div className="card-row carousel-card-settings">
                                <h4 className="text-support-medium">Individual tariff</h4>
                                <TariffPill
                                    isETR={isETR}
                                    selectedTariff={selectedTariff}
                                    individualTariff={formatPercentage(countryData.etr, {})}
                                    mode={mode}
                                />
                            </div>
                            <DownloadShareButtons
                                targetId={cardId}
                                selectedCountry={countryData.country}
                                selectedCountryISO3={countryData.iso3}
                                selectedSector={countryData.sector}
                                selectedTariff={selectedTariff}
                                isETR={isETR}
                            />
                        </div>

                    )
                })}
            </div>
            <p className="carousel-scroll-message text-support-small">Scroll to the right to view more countries →</p>
        </div>
    );
}


