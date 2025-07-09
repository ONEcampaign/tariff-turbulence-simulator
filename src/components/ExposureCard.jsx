import * as React from "npm:react";
import {formatCurrency, formatPercentage} from "../js/format.js";
import {DownloadShareButtons} from "./common/DownloadShareButtons.js";

export const ExposureCard = React.forwardRef(function ({
                                                           data,
                                                           isETR
} = {}, ref) {
    const country = data.country === "all countries" ? "Africa" : data.country;

    let impactText = `Potential cost of US tariffs on ${country}`

    impactText = data.sector === "All sectors"
        ? impactText
        : `${impactText}'s ${data.sector.toLowerCase()} sector`;

    return (
        <div className="tariff-card exposure-card" id="exposure-card" ref={ref}>
            <div className="exposure-card-block">
                <h4 className="text-impact-small">
                    {impactText}
                </h4>
                <p className="tariff-text text-impact-large">
                    {formatCurrency(data.impact_usd, {short: false})}
                </p>
            </div>
            <div className="exposure-card-block">
                <p className="text-support-large">
                    Simulated tariff: <b>{formatPercentage(data.tariff, {})}</b>
                </p>
                <DownloadShareButtons
                    targetId="exposure-card"
                    selectedCountry={data.country}
                    selectedCountryISO3={data.iso3}
                    selectedSector={data.sector}
                    selectedTariff={data.tariff}
                    isETR={isETR}
                />
            </div>
        </div>
    )
})