export function ExposureCard({countryData} = {}) {
    return (
        <div className="tariff-card exposure-card">
            <div className="left-column">
                <h4
                    className="description-text">Exposure to the US tariffs for {countryData.country} exports of {countryData.product}
                </h4>
                <p className="exports-text">
                    Simulated tariff: <b>{countryData.tariff}</b>
                </p>
            </div>
            <div className="right-column">
                <p className="tariff-text">
                    {countryData.impact_usd}
                </p>
            </div>
        </div>
    )
};