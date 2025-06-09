```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
```
```jsx

function App() {
    const headline = "The Tariffs Game";
    const deck = "What’s the impact of tariffs on African economies? Use this simulation tool to find out.";

    return (
        <div>
            <Headline content={headline} />
            <Deck content={deck} />
        </div>
    )
}

display(
    <App />
)
```