export function ExposureCard({countryData} = {}) {
    return (
        <div className="tariff-card exposure-card">
            <div className="left-column">
                <span
                    className="description-text">Efective Tariff Rate for {countryData.country} exports of {countryData.product}
                </span>

                <span className="exports-text">
                    Exports to the US: <b>{countryData.exports}</b>
                </span>
            </div>
            <div className="right-column">
                <span className="tariff-text">
                    {countryData.etr}
                </span>
            </div>
        </div>
    )
};