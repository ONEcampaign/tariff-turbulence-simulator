export function ExposureCard({countryData} = {}) {
    return (
        <div className="tariff-card exposure-card">
            <div className="left-column">
                <span
                    className="description-text">Exposure to the US tariffs for {countryData.country} exports of {countryData.product}
                </span>

                <span className="exports-text">
                    Simulated tariff: <b>{countryData.tariff}</b>
                </span>
            </div>
            <div className="right-column">
                <span className="tariff-text">
                    {countryData.impact_usd}
                </span>
            </div>
        </div>
    )
};