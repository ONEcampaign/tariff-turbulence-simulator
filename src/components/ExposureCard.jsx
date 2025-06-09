export function ExposureCard({countryData} = {}) {
    return (
        <div className="tariff-card exposure-card">
            <span>{countryData.iso3}</span>
            <span>{countryData.exposure}</span>
            <span>{countryData.percent}</span>
        </div>
    )
};