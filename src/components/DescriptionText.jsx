import * as React from "npm:react";
import { formatPercentage, formatCurrency } from "../js/format.js";

export function DescriptionText({
                                    data,
                                    mode,
                                    isERT,
                                    selectedTariff,
                                    selectedUnits
                                } = {}) {
    if (!data || !mode) return null;

    const formatValue = (val) =>
        selectedUnits === "usd"
            ? formatCurrency(val, { short: false })
            : formatPercentage(val, { tariff: true });

    const getTariffText = (context) => {
        const tariff = formatPercentage(selectedTariff);
        if (isERT) {
            return {
                carousel: <>Using <b>each country's ETR</b>, </>,
                country: <>Using <b>sector-specific ETRs</b>, </>,
                sector: <>Using <b>country-specific ETRs</b>, </>
            }[context];
        } else {
            return (
                <>Using a <b>{tariff} simulated tariff</b> for all {context === "country" ? "sectors" : "countries"}, </>
            );
        }
    };

    const renderTopThree = (label, items) => (
        <>The most exposed {label} are <b>{items[0].label}</b> ({items[0].value}), <b>{items[1].label}</b> ({items[1].value}) and <b>{items[2].label}</b> ({items[2].value}).</>
    );

    const getTopItems = (arr, key, labelKey, formatter = formatValue) => {
        return [...arr]
            .filter(d => typeof d[key] === "number" && Number.isFinite(d[key]))
            .sort((a, b) => b[key] - a[key])
            .slice(0, 3)
            .map(d => ({
                label: d[labelKey],
                value: formatter(d[key])
            }));
    };

    if (mode === "carousel") {
        const sortKey = selectedUnits === "usd" ? "impact_usd" : "etr";
        const totalImpactUSD = data.reduce((sum, d) => sum + (Number.isFinite(d.impact_usd) ? d.impact_usd : 0), 0);
        const topThree = getTopItems(data, sortKey, "country");

        return (
            <div className="description-container">
                <p className="text-body description-text">
                    {getTariffText("carousel")} Africa's total exposure to US tariffs is <b>{formatCurrency(totalImpactUSD, { short: false })}</b>.
                </p>
                <p className="text-body description-text">
                    The countries with the highest exposure {selectedUnits === "usd" ? "in dollar terms" : "in terms of ETR"} are{" "}
                    <b>{topThree[0].label}</b> ({topThree[0].value}), <b>{topThree[1].label}</b> ({topThree[1].value}) and <b>{topThree[2].label}</b> ({topThree[2].value}).
                </p>
            </div>
        );
    }

    if (mode === "country") {
        const country = data[0].country;
        const allSectors = data.find(d => d.sector === "All sectors");
        const totalImpactUSD = allSectors?.impact_usd;
        // const totalImpactPCT = allSectors?.impact_pct;
        // const impactPCTText = totalImpactPCT != null ? `, equivalent to ${formatPercentage(totalImpactPCT, { tariff: false })} of GDP` : "";
        const topSectors = getTopItems(data.filter(d => d.sector !== "All sectors"), "impact_usd", "sector");

        return (
            <div className="description-container">
                <p className="text-body description-text">
                    {getTariffText("country")} {country}'s total exposure to US tariffs is <b>{formatCurrency(totalImpactUSD, { short: false })}</b>.
                </p>
                <p className="text-body description-text">
                    {renderTopThree("sectors", topSectors)}
                </p>
            </div>
        );
    }

    if (mode === "sector") {
        const sector = data[0].sector;
        const allCountries = data.find(d => d.country === "All countries");
        const totalImpactUSD = allCountries?.impact_usd;
        const topCountries = getTopItems(data.filter(d => d.country !== "All countries"), "impact_usd", "country");

        return (
            <div className="description-container">
                <p className="text-body description-text">
                    {getTariffText("sector")} the total exposure of Africa's {sector.toLowerCase()} sector to US tariffs is <b>{formatCurrency(totalImpactUSD, { short: false })}</b>.
                </p>
                <p className="text-body description-text">
                    {renderTopThree("countries", topCountries)}
                </p>
            </div>
        );
    }

    return null;
}
