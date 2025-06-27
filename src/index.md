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
import {ChevronDown} from "./components/Chevron.js";
import {
    generateCrossData,
    generateMapData,
    generateCountryEntries,
    generateSectorGroups,
    generateExposureCardData,
    generateTooltipData,
    generateCarouselData,
    generateSelectionCardData,
    binaryFilter
} from "./js/transformData.js";
import {
    headline, deck, introText, legendTitle, legendSubtitle, subsectionTitle, subsectionText
} from "./js/copyText.js";

const recentData = FileAttachment("./data/africa_exports_to_us_2022_2024_ustrade.csv").csv({typed: true});
const historicalData = FileAttachment("./data/africa_exports_to_us_2002_2023_baci.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {

    // Hexmap dimensions
    const width = 600;
    const height = 600;

    // Reactive variables
    const [selectedCountry, setSelectedCountry] = React.useState('ALL');
    const [selectedSector, setSelectedSector] = React.useState('All sectors');
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
    const [showMore, setShowMore] = React.useState(false);
    const [hideMenu, setHideMenu] = React.useState(false);

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
        isManualTariff,
        setShowMore
    });

    // Data to use on hexMap
    const mapData = generateMapData(crossData, geoData, selectedSector)

    // Set data on click
    const selectedRecentData = crossData.find(
        d => d.iso3 === selectedCountry && d.sector === selectedSector
    );

    // Set data on hover
    const hoveredData = crossData.find(
        d => d.iso3 === tooltipContent.iso3 && d.sector === selectedSector
    );

    const exposureCardData = generateExposureCardData(selectedRecentData, selectedTariff);
    const tooltipData = generateTooltipData(hoveredData);
    const carouselData = generateCarouselData(crossData, selectedSector, selectedIndividualTariff)
    const selectionCardData = generateSelectionCardData(crossData, selectedCountry, selectedSector, selectedIndividualTariff)
    const selectedHistoricalData = binaryFilter(historicalData, selectedCountry, selectedSector)

    // Generate iso3-country name map for dropdown menu
    const countryEntries = generateCountryEntries(crossData);
    const countryMap = Object.fromEntries(countryEntries);

    // Generate a list of unique sector groups fro dropdown menu
    const sectorGroups = generateSectorGroups(crossData);

    // Determine the ETR for all countries
    const allETR = crossData.find(d => d.iso3 === 'ALL' && d.sector === selectedSector)?.etr;

    // Dtermine the ETR for selected data
    const selectedETR = selectedRecentData?.etr;

    return (
        <div className="wrapper">
            <div className={`sticky-controls ${hideMenu === true ? "hidden" : ""}`}>
                <div
                    className="sticky-tab"
                    onClick={() => setHideMenu(!hideMenu)}
                >
                    <span className="text-inputs">
                        {`${hideMenu === true ? 'Show' : 'Hide'} controls`}
                    </span>
                    <ChevronDown className={`dropdown-chevron ${hideMenu == true ? "rotate" : ""}`}/>
                </div>
                <div className='sticky-wrapper'>
                    <div className='sticky-content'>
                        <h4 className="text-support-medium">Filter the data</h4>
                        <div className="dropdowns-wrapper">
                            <Dropdown
                                dropdownId="countryMenu"
                                options={countryMap}
                                selectedOption={selectedCountry}
                                setOption={updateCountry}
                                setETR={setSelectedTariff}
                                getETRForOption={(iso3) => {
                                    const etr = crossData.find(d => d.iso3 === iso3 && d.sector === selectedSector)?.etr
                                    return Number.isFinite(etr) ? etr : null;
                                }}
                            />
                            <h4 className="text-support-medium center-aligned">or</h4>
                            <Dropdown
                                dropdownId="sectorMenu"
                                options={sectorGroups}
                                selectedOption={selectedSector}
                                setOption={updateSector}
                                setETR={setSelectedTariff}
                                getETRForOption={(sector) => {
                                    const etr = crossData.find(d => d.iso3 === selectedCountry && d.sector === sector)?.etr;
                                    return Number.isFinite(etr) ? etr : null;
                                }}
                            />
                        </div>
                        <div className="controls-separator"></div>
                        <h4 className="text-support-medium extra-margin">Simulate tariff</h4>
                        <Slider
                            selectedTariff={selectedTariff ?? 0}
                            setSelectedTariff={setSelectedTariff}
                            selectedIndividualTariff={selectedIndividualTariff}
                            setSelectedIndividualTariff={setSelectedIndividualTariff}
                            setIsManualTariff={setIsManualTariff}
                            etr={Number.isFinite(selectedRecentData.etr) ? selectedRecentData.etr : null}
                        />
                    </div>
                </div>
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
                    allETR={allETR}
                    setTooltip={setTooltipContent}
                />
                <Tooltip
                    x={tooltipContent.x}
                    y={tooltipContent.y}
                    data={tooltipData}
                    isVisible={isTooltipVisible}
                />
                <ExposureCard data={exposureCardData}/>
                <SubsectionTitle content={subsectionTitle}/>
                <SubsectionText content={subsectionText}/>
                {
                    selectedCountry === "ALL" && selectedSector === "All sectors" ? (
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
                            mode={selectedCountry === "ALL" ? "sector" : "country"}
                            selectedTariff={selectedTariff}
                            selectedIndividualTariff={selectedIndividualTariff}
                            setSelectedIndividualTariff={setSelectedIndividualTariff}
                            showMore={showMore}
                            setShowMore={setShowMore}
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