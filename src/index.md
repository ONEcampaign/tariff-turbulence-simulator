```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { Legend } from './components/Legend.js';
import { ChartTitle } from './components/ChartTitle.js';
import { ChartSubTitle } from './components/ChartSubTitle.js';
import { AfricaHexmap } from './components/AfricaHexmap.js';

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
console.log(geoData)

// TODO: merge geoData and data
```
```jsx

function App() {
    const headline = "The Tariffs Game";
    const deck = "What’s the impact of tariffs on African economies? Use this simulation tool to find out.";

    const [clickedCountry, setClickedCountry] = React.useState('All');

    const width = 600;
    const height = 600;

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
                data={geoData}
                clickedCountry={clickedCountry}
                onClick={setClickedCountry}
            />
        </div>
    )
}

display(
    <App />
)
```