export function ExposureCard({countryData} = {}) {
    return (
        <div className="tariff-card exposure-card">
            <span>{countryData.country}</span><br></br>
            <span>{countryData.etr}</span><br></br>
            <span>{countryData.exports}</span>
        </div>
    )
};