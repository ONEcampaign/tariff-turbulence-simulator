import * as React from "npm:react";
import {formatPercentage, formatCurrency} from "../js/format.js";

export function DescriptionText(
    {
        data,
        mode,
        isERT,
        selectedTariff,
        selectedUnits
    } = {}) {

    if (mode === "carousel") {

        const sortKey = selectedUnits === "usd" ? "impact_usd" : "impact_pct";

        const topThree = [...data]
            .filter(d => typeof d[sortKey] === "number" && Number.isFinite(d[sortKey]))
            .sort((a, b) => b[sortKey] - a[sortKey])
            .slice(0, 3)
            .map(d => ({
                country: d.country,
                value: selectedUnits === "usd" ? formatCurrency(d[sortKey], {short: false}) : formatPercentage(d[sortKey], {tariff: false})
            }));

        const totalImpactUSD = data.reduce((sum, d) => {
            return sum + (Number.isFinite(d.impact_usd) ? d.impact_usd : 0);
        }, 0);

        const tariffText = isERT ? (
            <>Using <b>each country's ETR</b>, </>
        ) : (
            <>Using a <b>{formatPercentage(selectedTariff)} simulated tariff</b>, </>
        );

        const unitText = selectedUnits === "usd" ?
            "in dollar terms" :
            "as a share of GDP";


        return (
            <div className="description-container">
                <p className="text-body description-text">
                    {tariffText} the total exposure of all African countries to US tariffs is <b>{formatCurrency(totalImpactUSD, {short: false})}</b>.
                </p>
                <p className="text-body description-text">
                    The countries with the highest exposure {unitText} are <b>{topThree[0].country}</b> ({topThree[0].value}), <b>{topThree[1].country}</b> ({topThree[1].value}) and <b>{topThree[2].country}</b> ({topThree[2].value}).
                </p>
            </div>
        )
    }

    else {

        if (mode === "country") {

            const country = data[0].country;

            const tariffText = isERT ? (
                <>Using <b>sector-specific ETRs</b>, </>
            ) : (
                <>Using a <b>{formatPercentage(selectedTariff)} simulated tariff</b> for all sectors, </>
            );

            const totalImpactUSD = data.find(d => d.sector === "All sectors").impact_usd;

            const totalImpactPCT = data.find(d => d.sector === "All sectors").impact_pct;

            const impactPCTText = totalImpactPCT !== null ?
                `, equivalent to ${formatPercentage(totalImpactPCT, {tariff: false})} of GDP` :
                "";

            const topSectors = [...data]
                .filter(d => d.sector !== "All sectors")
                .filter(d => typeof d.impact_usd === "number" && Number.isFinite(d.impact_usd))
                .sort((a, b) => b.impact_usd - a.impact_usd)
                .slice(0, 3)
                .map(d => ({
                    sector: d.sector,
                    value: formatCurrency(d.impact_usd, {short: false})
                }));

            return (
                <div className="description-container">
                    <p className="text-body description-text">
                        {tariffText} {country}'s total exposure to US tariffs is <b>{formatCurrency(totalImpactUSD, {short: false})}</b>{impactPCTText}.
                    </p>
                    <p className="text-body description-text">
                        The most exposed sectors are <b>{topSectors[0].sector}</b> ({topSectors[0].value}), <b>{topSectors[1].sector}</b> ({topSectors[1].value}) and <b>{topSectors[2].sector}</b> ({topSectors[2].value}).
                    </p>
                </div>
            )
        }

        else if (mode === "sector") {
            const sector = data[0].sector;

            const tariffText = isERT ? (
                <>Using <b>country-specific ETRs</b>, </>
            ) : (
                <>Using a <b>{formatPercentage(selectedTariff)} simulated tariff</b> for all countries, </>
            );

            const totalImpactUSD = data.find(d => d.country === "All countries").impact_usd;

            const topSectors = [...data]
                .filter(d => d.country !== "All countries")
                .filter(d => typeof d.impact_usd === "number" && Number.isFinite(d.impact_usd))
                .sort((a, b) => b.impact_usd - a.impact_usd)
                .slice(0, 3)
                .map(d => ({
                    country: d.country,
                    value: formatCurrency(d.impact_usd, {short: false})
                }));

            return (
                <div className="description-container">
                    <p className="text-body description-text">
                        {tariffText} the total exposure of Africa's {sector.toLowerCase()} sector to US tariffs is <b>{formatCurrency(totalImpactUSD, {short: false})}</b>.
                    </p>
                    <p className="text-body description-text">
                        The most exposed countries are <b>{topSectors[0].country}</b> ({topSectors[0].value}), <b>{topSectors[1].country}</b> ({topSectors[1].value}) and <b>{topSectors[2].country}</b> ({topSectors[2].value}).
                    </p>
                </div>
            )
        }


    }
}