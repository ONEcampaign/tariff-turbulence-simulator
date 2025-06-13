```js
import { Headline } from './components/Headline.js';
import { Deck } from './components/Deck.js';
import { IntroText } from './components/IntroText.js'
import { Legend } from './components/Legend.js';
import { AfricaHexmap } from './components/AfricaHexmap.js';
import { ExposureCard } from './components/ExposureCard.js';
import { Dropdown } from "./components/Dropdown.js";
import { DropdownProvider } from "./components/DropdownContext.js";
import { Slider } from "./components/Slider.js";
import { Tooltip } from "./components/Tooltip.js";
import {
    generateCrossData, generateMapData,
    generateCountryEntries, generateProductGroups,
    generateCountryData, generateTooltipData
} from "./js/transformData.js";
import {
    headline, deck, introText, legendTitle, legendSubtitle
} from "./js/copyText.js";

const data = FileAttachment("./data/us_africa_trade.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {

    // Hexmap dimensions
    const width = 600;
    const height = 600;    

    // Reactive variables
    const [clickedCountry, setClickedCountry] = React.useState('ALL');
    const [clickedSector, setClickedSector] = React.useState('All products');
    const [selectedTariff, setSelectedTariff] = React.useState();
    const [tooltipContent, setTooltipContent] = React.useState({
        iso3: null,
        country: null,
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

    const countryData = generateCountryData(selectedData, selectedTariff);
    const tooltipData = generateTooltipData(hoveredData, selectedTariff);

    // Generate iso3-country name map for dropdown menu
    const countryEntries = generateCountryEntries(crossData);
    const countryMap = Object.fromEntries(countryEntries);

    // Generate a list of unique product groups fro dropdown menu
    const productGroups = generateProductGroups(crossData);

    // Determine the ETR for all countries
    const allETR = crossData.find(d => d.iso3 === 'ALL' && d.product === clickedSector)?.etr ?? 0;

    return (
        <div className="wrapper">
            <div className="sticky-controls">
                <span className="filter-title">Filter the data</span>
                <Dropdown
                    dropdownId="countryMenu"
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
                    dropdownId="productMenu"
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
    <DropdownProvider>
        <App />
    </DropdownProvider>
)
```