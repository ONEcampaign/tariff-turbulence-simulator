```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { Legend } from './components/Legend.js';
import { ChartTitle } from './components/ChartTitle.js';
import { ChartSubTitle } from './components/ChartSubTitle.js';
import { AfricaHexmap } from './components/AfricaHexmap.js';
import { ExposureCard } from './components/ExposureCard.js';
import { Dropdown } from "./components/Dropdown.js"

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {
    const headline = "The Tariffs Game";
    const deck = "What’s the impact of US tariffs on African economies? Use this simulation tool to find out.";

    const [clickedCountry, setClickedCountry] = React.useState('ALL');
    const [clickedSector, setClickedSector] = React.useState('All products');

    const width = 600;
    const height = 600;

    const mapData = {
        type: "FeatureCollection",
        features: geoData.features.map(feat => {
            const iso3 = feat.properties.iso3;

            // Find matching row by iso3 and product_group (if any filter applied)
            const row = data.find(d =>
                d.iso3 === iso3 && d.product_group === clickedSector
            );

            return {
                ...feat,
                properties: {
                    ...feat.properties,
                    value: row?.value ?? null,
                    etr: row?.etr ?? null
                }
            };
        })
    };

    const selectedData = data.find(
        d => d.iso3 === clickedCountry && d.product_group === clickedSector
    );

    function formatExports(value) {
        const absValue = Math.abs(value);

        if (absValue >= 1e9) {
            return `$${d3.format(",.1f")(value / 1e9)} B`;
        } else if (absValue >= 1e6) {
            return `$${d3.format(",.1f")(value / 1e6)} M`;
        } else {
            return `$${d3.format(",.1f")(value)}`;
        }
    }

    const countryData = {
        country: selectedData.country === "All countries"
            ? "all countries"
            : selectedData.country,
        product: selectedData.product_group.toLowerCase(),
        etr: selectedData?.etr != null
            ? `${Math.round(selectedData.etr)}%`
            : null,
        exports: selectedData.value != null
            ? formatExports(selectedData.value)
            : null
    };

    const countryMap = Object.fromEntries(
        data.map(d => [d.iso3, d.country])
    );

    const productGroups = Array.from(
        new Set(data.map(d => d.product_group))
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

    console.log("clickedCountry:", clickedCountry);
}

display(
    <App/>
)
```