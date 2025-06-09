```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { Legend } from './components/Legend.js';
import { ChartTitle } from './components/ChartTitle.js';
import { ChartSubTitle } from './components/ChartSubTitle.js';

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
```
```jsx

function App() {
    const headline = "The Tariffs Game";
    const deck = "What’s the impact of tariffs on African economies? Use this simulation tool to find out.";

    return (
        <div className="wrapper">
            <Headline content={headline} />
            <Deck content={deck} />
            <ChartTitle content={""} />
            <ChartSubTitle content={""} />
            <Legend />
        </div>
    )
}

display(
    <App />
)
```