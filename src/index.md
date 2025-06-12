```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { Legend } from './components/Legend.js';
import { ChartTitle } from './components/ChartTitle.js';
import { ChartSubTitle } from './components/ChartSubTitle.js';
import { AfricaHexmap } from './components/AfricaHexmap.js';
import { ExposureCard } from './components/ExposureCard.js';
import { Dropdown } from "./components/Dropdown.js"
import { Slider } from "./components/Slider.js"

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {
    const headline = "The Tariffs Game";
    const deck = "What’s the impact of US tariffs on African economies? Use this simulation tool to find out.";

    const [clickedCountry, setClickedCountry] = React.useState('ALL');
    const [clickedSector, setClickedSector] = React.useState('All products');
    const [selectedTariff, setSelectedTariff] = React.useState();

    const selectedData = data.find(
        d => d.iso3 === clickedCountry && d.product === clickedSector
    );

    // Set ETR as default tariff
    React.useEffect(() => {
        if (selectedData?.etr != null && selectedTariff == null) {
            setSelectedTariff(Math.round(selectedData.etr));
        }
    }, [selectedData, selectedTariff]);

    const width = 600;
    const height = 600;

    const mapData = {
        type: "FeatureCollection",
        features: geoData.features.map(feat => {
            const iso3 = feat.properties.iso3;

            // Find matching row by iso3 and product (if any filter applied)
            const row = data.find(d =>
                d.iso3 === iso3 && d.product === clickedSector
            );

            return {
                ...feat,
                properties: {
                    ...feat.properties,
                    exposure_usd: row?.exports * selectedTariff * 0.01 ?? null,
                    exposure_pct: row?.exports * selectedTariff / row?.gdp ?? null,
                    exports: row?.exports ?? null,
                    etr: row?.etr ?? null,
                    gdp: row?.gdp ?? null
                }
            };
        })
    };

    function formatCurrency(value) {
        const absValue = Math.abs(value);

        if (absValue >= 1e8) {
            return `$${d3.format(",.1f")(value / 1e9)} B`;
        } else if (absValue >= 1e5) {
            return `$${d3.format(",.1f")(value / 1e6)} M`;
        } else {
            return `$${d3.format(",.1f")(value)}`;
        }
    }

    const countryData = {
        country: selectedData.country === "All countries"
            ? "all countries"
            : selectedData.country,
        product: selectedData.product.toLowerCase(),
        tariff: `${d3.format(",.1f")(selectedTariff)}%`,
        exports: selectedData.exports != null
            ? formatCurrency(selectedData.exports)
            : null,
        impact_usd: selectedData.exports != null 
            ? formatCurrency(selectedData.exports * selectedTariff * 0.01)
            : null
    };

    const countryMap = Object.fromEntries(
        data.map(d => [d.iso3, d.country])
    );

    const productGroups = Array.from(
        new Set(data.map(d => d.product))
    );

    return (
        <div className="wrapper">
            <div className="sticky-controls">
                <span className="filter-title">Filter the data</span>
                <Dropdown
                    options={countryMap}
                    selectedOption={clickedCountry}
                    setOption={setClickedCountry}
                />
                <Dropdown
                    options={productGroups}
                    selectedOption={clickedSector}
                    setOption={setClickedSector}
                />
                <div className="separator"></div>
                <span className="filter-title">Simulate tariff</span>
                <Slider 
                    value={selectedTariff} 
                    setValue={setSelectedTariff} 
                    etr={Math.round(selectedData?.etr)} 
                />
            </div>
            <div className="center-block">
                <Headline content={headline}/>
                <Deck content={deck}/>
                <ChartTitle content={""}/>
                <ChartSubTitle content={""}/>
                <Legend/>
                <AfricaHexmap
                    width={width}
                    height={height}
                    data={mapData}
                    clickedCountry={clickedCountry}
                    onClick={setClickedCountry}
                />
                <ExposureCard countryData={countryData}/>
            </div>
        </div>
    )
}

display(
    <App/>
)
```