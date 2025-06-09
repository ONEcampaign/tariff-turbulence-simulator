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
console.log(data, geoData)

```
```jsx

function App() {
    const headline = "The Tariffs Game";
    const deck = "What’s the impact of tariffs on African economies? Use this simulation tool to find out.";

    const [clickedCountry, setClickedCountry] = React.useState('All');
    const [clickedSector, setClickedSector] = React.useState('All');

    const width = 600;
    const height = 600;
    
    const mapData = {
        type: "FeatureCollection",
        features: geoData.features.map(feat => {
            return {
                ...feat,
                "data": {
                    // TODO: recalculate exposure and percent of GDP
                    // for each country based on current dropdown selections
                    // data.filter(d => (clickedCountry === 'All' || d.iso3 === clickedCountry) && (clickedSector === 'All' || d.product_group === clickedSector))
                    exposure: 3500000,
                    percent: 17
                }
            }
        })
    };

    const countryData = {
        iso3: clickedCountry,
        exposure: 123123, // TODO: get these values from mapData for clickedCountry
        percent: 1765,
    }

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