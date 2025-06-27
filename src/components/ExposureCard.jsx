import {formatCurrency, formatPercentage} from "../js/format.js";

export function ExposureCard({data} = {}) {
    return (
        <div className="tariff-card exposure-card">
            <div className="left-column">
                <h4
                    className="text-impact-small">Exposure to US tariffs for {data.country} exports of {data.sector}
                </h4>
                <p className="text-support-large">
                    Simulated tariff: <b>{formatPercentage(data.tariff, {})}</b>
                </p>
            </div>
            <div className="right-column">
                <p className="tariff-text text-impact-large">
                    {formatCurrency(data.impact_usd)}
                </p>
            </div>
        </div>
    )
};