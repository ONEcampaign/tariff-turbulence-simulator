```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { Legend } from './components/Legend.js';
import { ChartTitle } from './components/ChartTitle.js';
import { ChartSubTitle } from './components/ChartSubTitle.js';
import { AfricaHexmap } from './components/AfricaHexmap.js';
import { ExposureCard } from './components/ExposureCard.js';

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx

function App() {
    const headline = "The Tariffs Game";
    const deck = "What’s the impact of tariffs on African economies? Use this simulation tool to find out.";

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

    const exports = selectedData.value * 1e-6;
    const formattedExports = exports < 0.1
        ? d3.format(",.2f")(exports)
        : Math.abs(exports) < 1
            ? d3.format(",.1f")(exports)
            : d3.format(",.0f")(exports);

    const countryData = {
        country: selectedData.country,
        etr: selectedData?.etr != null
            ? `${Math.round(selectedData.etr)}%`
            : null,
        exports: exports != null
            ? `US$ ${formattedExports} M`
            : null
    };
    
    return (
        <div className="wrapper">
            <Headline content={headline} />
            <Deck content={deck} />
            <ChartTitle content={""} />
            <ChartSubTitle content={""} />
            <Legend />
            <AfricaHexmap
                width={width}
                height={height}
                data={mapData}
                clickedCountry={clickedCountry}
                onClick={setClickedCountry}
            />
            <ExposureCard countryData={countryData} />
        </div>
    )
}

display(
    <App />
)
```