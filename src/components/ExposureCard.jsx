import {formatCurrency, formatPercentage, possessive} from "../js/format.js";

export function ExposureCard({data} = {}) {

    const country = data.country === "all countries" ? "Africa" : data.country;

    let impactText = `${possessive(country)} exposure to US tariffs`

    impactText = data.sector === "all sectors"
        ? impactText
        : `${impactText} for ${data.sector} sector`;

    return (
        <div className="tariff-card exposure-card" id="exposure-card">
            <div className="left-column">
                <h4 className="text-impact-small">
                    {impactText}
                </h4>
                <p className="text-support-large">
                    Simulated tariff: <b>{formatPercentage(data.tariff, {})}</b>
                </p>
            </div>
            <div className="right-column">
                <p className="tariff-text text-impact-large">
                    {formatCurrency(data.impact_usd, {short: false})}
                </p>
            </div>
        </div>
    )
};