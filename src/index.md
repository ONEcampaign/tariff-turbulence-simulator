```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { IntroText } from './components/IntroText.js'
import { Legend } from './components/Legend.js';
import { AfricaHexmap } from './components/AfricaHexmap.js';
import { ExposureCard } from './components/ExposureCard.js';
import { Dropdown } from "./components/Dropdown.js";
import { Slider } from "./components/Slider.js";

import { formatCurrency } from "./js/format.js";

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {
    const headline = "Tariff Simulator";
    const deck = "What’s the impact of US tariffs on African economies? Use this simulation tool to find out.";
    const introText = "Tariffs are like taxes on exports, and some products get hit harder than others. The Effective Tariff Rate (ETR) reflects the average tariff a country faces, weighted by the value of its exports. It offers a clearer view of how US tariffs affect each economy.";
    const legendTitle = "Exposure to US tariffs by country"
    const legendSubtitle = "Based on the Effective Tarriff Rate (ETR)"

    const [clickedCountry, setClickedCountry] = React.useState('ALL');
    const [clickedSector, setClickedSector] = React.useState('All products');
    const [selectedTariff, setSelectedTariff] = React.useState();

    const selectedData = data.find(
        d => d.iso3 === clickedCountry && d.product === clickedSector
    );

    // Set ETR as default tariff
    React.useEffect(() => {
        if (selectedData?.etr != null && selectedTariff == null) {
            setSelectedTariff(selectedData.etr);
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
                    etr: row?.etr ?? null,
                    // exposure_usd: row?.exports * selectedTariff * 0.01 ?? null,
                    // exposure_pct: row?.exports * selectedTariff / row?.gdp ?? null,
                    // exports: row?.exports ?? null,
                    // gdp: row?.gdp ?? null
                }
            };
        })
    };

    const countryData = {
        country: selectedData.country === "All countries"
            ? "all countries"
            : selectedData.country,
        product: selectedData.product.toLowerCase(),
        tariff: `${selectedTariff}%`,
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

    const allETR = data.find(d => d.iso3 === 'ALL' && d.product === clickedSector)?.etr ?? 0;

    return (
        <div className="wrapper">
            <div className="sticky-controls">
                <span className="filter-title">Filter the data</span>
                <Dropdown
                    options={countryMap}
                    selectedOption={clickedCountry}
                    setOption={setClickedCountry}
                    setETR={setSelectedTariff}
                    getETRForOption={(iso3) => {
                        const etr = data.find(d => d.iso3 === iso3 && d.product === clickedSector)?.etr
                        return Number.isFinite(etr) ? etr : 0;
                    }}
                />
                <Dropdown
                    options={productGroups}
                    selectedOption={clickedSector}
                    setOption={setClickedSector}
                    setETR={setSelectedTariff}
                    getETRForOption={(product) => {
                        const etr = data.find(d => d.iso3 === clickedCountry && d.product === product)?.etr;
                        return Number.isFinite(etr) ? etr : 0;
                    }}
                />
                <div className="separator"></div>
                <span className="filter-title">Simulate tariff</span>
                <Slider
                    value={selectedTariff ?? 0}
                    setValue={setSelectedTariff}
                    etr={Number.isFinite(selectedData.etr) ? selectedData.etr : 0}
                />
            </div>
            <div className="main-block">
                <Headline content={headline}/>
                <Deck content={deck}/>
                <IntroText content={introText}/>
                <Legend
                    title={legendTitle}
                    subtitle={legendSubtitle}
                />
                <AfricaHexmap
                    width={width}
                    height={height}
                    data={mapData}
                    clickedCountry={clickedCountry}
                    setCountry={setClickedCountry}
                    setETR={setSelectedTariff}
                    allETR={Number.isFinite(allETR) ? allETR : 0}
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