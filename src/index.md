```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { IntroText } from './components/IntroText.js'
import { Legend } from './components/Legend.js';
import { AfricaHexmap } from './components/AfricaHexmap.js';
import { ExposureCard } from './components/ExposureCard.js';
import { Dropdown } from "./components/Dropdown.js";
import { Slider } from "./components/Slider.js";
import { Tooltip } from "./components/Tooltip.js";
import { formatCurrency, formatPercentage } from "./js/format.js";
import { generateCrossData, generateMapData } from "./js/transformData.js";

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {

    // Hexmap dimensions
    const width = 600;
    const height = 600;

    // Text variables
    const headline = "Tariff Simulator";
    const deck = "What’s the impact of US tariffs on African economies? Use this simulation tool to find out.";
    const introText = "Tariffs are like taxes on exports, and some products get hit harder than others. The Effective Tariff Rate (ETR) reflects the average tariff a country faces, weighted by the value of its exports. It offers a clearer view of how US tariffs affect each economy.";
    const legendTitle = "Exposure to US tariffs by country"
    const legendSubtitle = "Based on the Effective Tarriff Rate (ETR)"

    // Reactive variables
    const [clickedCountry, setClickedCountry] = React.useState('ALL');
    const [clickedSector, setClickedSector] = React.useState('All products');
    const [selectedTariff, setSelectedTariff] = React.useState();
    const [tooltipContent, setTooltipContent] = React.useState({
        iso3: null,
        x: null,
        y: null
    })
    const isTooltipVisible = tooltipContent.country !== null;

    // Crossed data between csv and geojson to make sure all countries are present
    const crossData = generateCrossData(data, geoData)

    // Data to use on hexMap
    const mapData = generateMapData(crossData, geoData, clickedSector)

    // Set data on click
    const selectedData = crossData.find(
        d => d.iso3 === clickedCountry && d.product === clickedSector
    );

    // Set data on hover
    const hoveredData = crossData.find(
        d => d.iso3 === tooltipContent.iso3 && d.product === clickedSector
    );

    // Set ETR as default tariff
    React.useEffect(() => {
        if (selectedData?.etr != null && selectedTariff == null) {
            setSelectedTariff(selectedData.etr);
        }
    }, [selectedData, selectedTariff]);

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

    const tooltipData = {
        country: hoveredData?.country === "All countries"
            ? "all countries"
            : hoveredData?.country,
        product: hoveredData?.product.toLowerCase(),
        tariff: `${selectedTariff}%`,
        exports: hoveredData?.exports != null
            ? formatCurrency(hoveredData.exports)
            : null,
        impact_usd: hoveredData?.exports != null
            ? formatCurrency(hoveredData.exports * selectedTariff * 0.01)
            : null,
        impact_pct: hoveredData?.exports != null && hoveredData.gdp != null
            ? formatPercentage(hoveredData.exports * selectedTariff * 0.01 / hoveredData.gdp)
            : null
    };

    // Generate iso3-country name map for dropdown menu
    const countryMap = Object.fromEntries(
        crossData.map(d => [d.iso3, d.country])
    );

    // Generate a list of unique product groups fro dropdown menu
    const productGroups = Array.from(
        new Set(crossData.map(d => d.product))
    );

    // Determine the ETR for all countries
    const allETR = crossData.find(d => d.iso3 === 'ALL' && d.product === clickedSector)?.etr ?? 0;

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
                        const etr = crossData.find(d => d.iso3 === iso3 && d.product === clickedSector)?.etr
                        return Number.isFinite(etr) ? etr : 0;
                    }}
                />
                <Dropdown
                    options={productGroups}
                    selectedOption={clickedSector}
                    setOption={setClickedSector}
                    setETR={setSelectedTariff}
                    getETRForOption={(product) => {
                        const etr = crossData.find(d => d.iso3 === clickedCountry && d.product === product)?.etr;
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
                    setTooltip={setTooltipContent}
                />
                <Tooltip
                    x={tooltipContent.x}
                    y={tooltipContent.y}
                    tooltipData={tooltipData}
                    isVisible={isTooltipVisible}
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