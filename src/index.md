---
sidebar: false
header: false
footer: false
pager: false
---
```js
const observer = new ResizeObserver(([entry]) => parent.postMessage({height: entry.target.offsetHeight}, "*"));
observer.observe(document.documentElement);
```

```js
import {Headline} from './components/Headline.js';
import {Deck} from './components/Deck.js';
import {IntroText} from './components/IntroText.js'
import {Legend} from './components/Legend.js';
import {AfricaHexmap} from './components/AfricaHexmap.js';
import {ExposureCard} from './components/ExposureCard.js';
import {Dropdown} from "./components/Dropdown.js";
import {DropdownProvider} from "./components/DropdownContext.js";
import {Slider} from "./components/Slider.js";
import {Tooltip} from "./components/Tooltip.js";
import {SubsectionTitle} from "./components/SubsectionTitle.js";
import {SubsectionText} from "./components/SubsectionText.js";
import {ToggleButton} from "./components/ToggleButton.js";
import {CountryCarousel} from "./components/CountryCarousel.js"
import {SelectionCard} from "./components/SelectionCard.js";
import {MutualExclusion} from "./components/MutualExclusion.js";
import {
    generateCrossData,
    generateMapData,
    generateCountryEntries,
    generateProductGroups,
    generateExposureCardData,
    generateTooltipData,
    generateCarouselData,
    generateSelectionCardData,
    binaryFilter
} from "./js/transformData.js";
import {
    headline, deck, introText, legendTitle, legendSubtitle, subsectionTitle, subsectionText
} from "./js/copyText.js";

const recentData = FileAttachment("./data/africa_exports_to_us_2024.csv").csv({typed: true});
const historicalData = FileAttachment("./data/africa_exports_to_us_2002_2023.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {

    // Hexmap dimensions
    const width = 600;
    const height = 600;

    // Reactive variables
    const [selectedCountry, setSelectedCountry] = React.useState('ALL');
    const [selectedSector, setSelectedSector] = React.useState('All products');
    const [selectedTariff, setSelectedTariff] = React.useState();
    const [selectedIndividualTariff, setSelectedIndividualTariff] = React.useState("ETR")
    const [isManualTariff, setIsManualTariff] = React.useState(false);
    const [tooltipContent, setTooltipContent] = React.useState({
        iso3: null,
        country: null,
        x: null,
        y: null
    })
    const isTooltipVisible = tooltipContent.country !== null;
    const [selectedUnits, setSelectedUnits] = React.useState("usd")

    // Crossed data between csv and geojson to make sure all countries are present
    const crossData = generateCrossData(recentData, geoData)

    const {
        updateCountry,
        updateSector
    } = MutualExclusion({
        selectedCountry,
        selectedSector,
        setSelectedCountry,
        setSelectedSector,
        crossData,
        setSelectedTariff,
        isManualTariff
    });

    // Data to use on hexMap
    const mapData = generateMapData(crossData, geoData, selectedSector)

    // Set data on click
    const selectedRecentData = crossData.find(
        d => d.iso3 === selectedCountry && d.product === selectedSector
    );

    // Set data on hover
    const hoveredData = crossData.find(
        d => d.iso3 === tooltipContent.iso3 && d.product === selectedSector
    );

    const exposureCardData = generateExposureCardData(selectedRecentData, selectedTariff);
    const tooltipData = generateTooltipData(hoveredData, selectedTariff);
    const carouselData = generateCarouselData(crossData, selectedSector, selectedIndividualTariff)
    const selectionCardData = generateSelectionCardData(crossData, selectedCountry, selectedSector, selectedIndividualTariff)
    const selectedHistoricalData = binaryFilter(historicalData, selectedCountry, selectedSector)

    // Generate iso3-country name map for dropdown menu
    const countryEntries = generateCountryEntries(crossData);
    const countryMap = Object.fromEntries(countryEntries);

    // Generate a list of unique product groups fro dropdown menu
    const productGroups = generateProductGroups(crossData);

    // Determine the ETR for all countries
    const allETR = crossData.find(d => d.iso3 === 'ALL' && d.product === selectedSector)?.etr ?? null;

    return (
        <div className="wrapper">
            <div className="sticky-controls">
                <h4 className="text-support-medium">Filter the data</h4>
                <Dropdown
                    dropdownId="countryMenu"
                    options={countryMap}
                    selectedOption={selectedCountry}
                    setOption={updateCountry}
                    setETR={setSelectedTariff}
                    getETRForOption={(iso3) => {
                        const etr = crossData.find(d => d.iso3 === iso3 && d.product === selectedSector)?.etr
                        return Number.isFinite(etr) ? etr : null;
                    }}
                    isInactive={selectedCountry === "ALL" && selectedSector !== "All products"}
                />
                <h4 className="text-support-medium center-aligned">or</h4>
                <Dropdown
                    dropdownId="productMenu"
                    options={productGroups}
                    selectedOption={selectedSector}
                    setOption={updateSector}
                    setETR={setSelectedTariff}
                    getETRForOption={(product) => {
                        const etr = crossData.find(d => d.iso3 === selectedCountry && d.product === product)?.etr;
                        return Number.isFinite(etr) ? etr : null;
                    }}
                    isInactive={selectedCountry !== "ALL" && selectedSector === "All products"}
                />
                <div className="controls-separator"></div>
                <span className="text-support-medium extra-margin">Simulate tariff</span>
                <Slider
                    selectedTariff={selectedTariff ?? 0}
                    setSelectedTariff={setSelectedTariff}
                    selectedIndividualTariff={selectedIndividualTariff}
                    setSelectedIndividualTariff={setSelectedIndividualTariff}
                    setIsManualTariff={setIsManualTariff}
                    etr={Number.isFinite(selectedRecentData.etr) ? selectedRecentData.etr : null}
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
                    clickedCountry={selectedCountry}
                    setCountry={setSelectedCountry}
                    setETR={setSelectedTariff}
                    allETR={Number.isFinite(allETR) ? allETR : null}
                    setTooltip={setTooltipContent}
                />
                <Tooltip
                    x={tooltipContent.x}
                    y={tooltipContent.y}
                    tooltipData={tooltipData}
                    isVisible={isTooltipVisible}
                />
                <ExposureCard countryData={exposureCardData}/>
                <SubsectionTitle content={subsectionTitle}/>
                <SubsectionText content={subsectionText}/>
                {
                    selectedCountry === "ALL" && selectedSector === "All products" ? (
                        <div>
                            <ToggleButton
                                selected={selectedUnits}
                                setSelected={setSelectedUnits}
                            />
                            <CountryCarousel
                                data={carouselData}
                                selectedTariff={selectedTariff}
                                selectedIndividualTariff={selectedIndividualTariff}
                                setSelectedIndividualTariff={setSelectedIndividualTariff}
                                selectedUnits={selectedUnits}
                            />
                        </div>
                    ) : (
                        <SelectionCard
                            data={selectionCardData}
                            historicalData={selectedHistoricalData}
                            mode={selectedCountry === "ALL" ? "product" : "country"}
                            selectedTariff={selectedTariff}
                            selectedIndividualTariff={selectedIndividualTariff}
                            setSelectedIndividualTariff={setSelectedIndividualTariff}
                        />
                    )
                }
            </div>
        </div>
    )
}

display(
    <DropdownProvider>
        <App/>
    </DropdownProvider>
)
```