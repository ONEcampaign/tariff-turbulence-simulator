---
sidebar: false
header: false
footer: false
pager: false
toc: false
---

```js
const observer = new ResizeObserver(([entry]) => window.parent.postMessage({height: entry.target.offsetHeight}, "https://data.one.org"));
observer.observe(document.documentElement);
```

```js
import * as React from "npm:react";
import {Intro} from "./components/Intro.js"
import {Legend} from "./components/Legend.js";
import {AfricaHexmap} from "./components/AfricaHexmap.js";
import {ExposureCard} from "./components/ExposureCard.js";
import {Dropdown} from "./components/Dropdown.js";
import {DropdownProvider} from "./components/DropdownContext.js";
import {Slider} from "./components/Slider.js";
import {Tooltip} from "./components/Tooltip.js";
import {SubsectionTitle} from "./components/SubsectionTitle.js";
import {DescriptionText} from "./components/DescriptionText.js";
import {ToggleButton} from "./components/ToggleButton.js";
import {CountryCarousel} from "./components/CountryCarousel.js"
import {SelectionCard} from "./components/SelectionCard.js";
import {Methodology} from "./components/Methodology.js";
import {MutualExclusion} from "./components/MutualExclusion.js";
import {ChevronDown} from "./components/ChevronDown.js";
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
    title, deck, introText, legendTitle, legendSubtitle, subsectionTitle
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
    const [selectedCountry, setSelectedCountry] = React.useState("ALL");
    const [selectedSector, setSelectedSector] = React.useState("All sectors");
    const [selectedTariff, setSelectedTariff] = React.useState();
    const [isETR, setIsETR] = React.useState(true);
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
    const [initialScroll, setInitialScroll] = React.useState(false);
    const [hasParsedURL, setHasParsedURL] = React.useState(false);
    const [userSetTariff, setUserSetTariff] = React.useState(false);

    const cardRef = React.useRef();
    const [showSlider, setShowSlider] = React.useState(false);
    const handleScroll = () => {
        const y = cardRef.current.getBoundingClientRect().top;
        setShowSlider(y <= 100); 
    };

    React.useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    React.useEffect(() => {
        const hash = window.location.hash;
        let parsedTariff = null;
        let parsedIsETR = true;

        if (hash.includes("?")) {
            const queryString = hash.split("?")[1];
            const query = new URLSearchParams(queryString);

            const country = query.get("country");
            const sector = query.get("sector");
            const tariff = query.get("tariff");
            const isETRParam = query.get("isETR");

            if (country) setSelectedCountry(country);
            if (sector) setSelectedSector(sector);

            parsedIsETR = isETRParam === "true";
            setIsETR(parsedIsETR);

            if (!parsedIsETR && tariff !== null) {
                const parsed = parseFloat(tariff);
                if (!isNaN(parsed)) {
                    parsedTariff = parsed;
                    setSelectedTariff(parsedTariff);
                    setUserSetTariff(true);
                }
            }
        }
        
        setHasParsedURL(true);
    }, []);

    React.useEffect(() => {
        if (!hasParsedURL) return;

        const query = new URLSearchParams();

        if (selectedSector !== "All sectors") {
            query.set("country", "ALL");
            query.set("sector", selectedSector);
        } else {
            query.set("country", selectedCountry);
            query.set("sector", "All sectors");
        }

        if (isETR) {
            query.set("isETR", "true");
        } else if (selectedTariff !== undefined) {
            query.set("tariff", selectedTariff.toString());
            query.set("isETR", "false");
        }

        window.history.replaceState(null, "", `#view?${query.toString()}`);
    }, [selectedCountry, selectedSector, selectedTariff, isETR, hasParsedURL]);
    
    // Crossed data between csv and geojson to make sure all countries are present
    const crossData = generateCrossData(recentData, geoData)

    // Ensure ETR is applied on first load (if not overridden via URL)
    React.useEffect(() => {
        if (!hasParsedURL) return;

        // Don't override if a custom tariff was set by the user
        if (!isETR || userSetTariff) return;

        const entry = crossData.find(d => d.iso3 === selectedCountry && d.sector === selectedSector);
        if (entry?.etr != null) {
            setSelectedTariff(entry.etr);
        }
    }, [hasParsedURL, isETR, userSetTariff, selectedCountry, selectedSector, crossData]);

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
        isETR,
        setIsETR,
        setShowMore,
        initialScroll,
        setInitialScroll,
        hasParsedURL,
        userSetTariff
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
    const carouselData = generateCarouselData(crossData, selectedTariff, isETR)
    const selectionCardData = generateSelectionCardData(crossData, selectedCountry, selectedSector, selectedTariff, isETR)
    const selectedHistoricalData = binaryFilter(historicalData, selectedCountry, selectedSector)

    // Generate iso3-country name map for dropdown menu
    const countryEntries = generateCountryEntries(crossData);
    const countryMap = Object.fromEntries(countryEntries);

    // Generate a list of unique sector groups fro dropdown menu
    const sectorGroups = generateSectorGroups(crossData);

    // Determine the ETR for all countries
    const allETR = crossData.find(d => d.iso3 === "ALL" && d.sector === selectedSector)?.etr;

    // Dtermine the ETR for selected data
    const selectedETR = selectedRecentData?.etr;

    // Define card mode
    const cardMode = selectedCountry === "ALL" && selectedSector === "All sectors"
        ? "carousel"
        : selectedCountry !== "ALL" && selectedSector === "All sectors"
            ? "country"
            : "sector"

    return (
        <div className="wrapper">
            <div className={`sticky-wrapper ${hideMenu ? "hidden" : ""}`}>
                <div
                    className="show-hide-tab"
                    onClick={() => setHideMenu(!hideMenu)}
                >
                    <h4 className="text-inputs">{hideMenu ? "Show" : "Hide"} controls</h4>
                    <ChevronDown className={`dropdown-chevron ${hideMenu ? "rotate" : ""}`}/>
                </div>
                <div className="controls-wrapper">
                    <h4 className="text-support-medium extra-margin"><b>Filter</b> the data</h4>
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
                            isInactive={selectedSector !== "All sectors"}
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
                            isInactive={selectedCountry !== "ALL"}
                        />
                    </div>
                    <div className="slider-opacity-container" style={{"opacity":  `${showSlider === true ? 1 : 0}`}}>
                        <div className="controls-separator"></div>
                        <h4 className="text-support-medium extra-margin"><b>Adjust</b> the tariff</h4>
                        <Slider
                            selectedTariff={selectedTariff ?? 0}
                            setSelectedTariff={setSelectedTariff}
                            setIsETR={setIsETR}
                            etr={Number.isFinite(selectedRecentData.etr) ? selectedRecentData.etr : null}
                        />
                    </div>
                    <div className="controls-separator"></div>
                    <h4 className="text-support-medium extra-margin"><b>Adjust</b> the tariff</h4>
                    <Slider
                        selectedTariff={selectedTariff ?? 0}
                        setSelectedTariff={setSelectedTariff}
                        isETR={isETR}
                        setIsETR={setIsETR}
                        etr={Number.isFinite(selectedRecentData.etr) ? selectedRecentData.etr : null}
                        setUserSetTariff={setUserSetTariff}
                    />
                </div>
            </div>
            <div className="main-block">
                <Intro />
                <Legend
                    title={legendTitle}
                    subtitle={legendSubtitle}
                />
                <AfricaHexmap
                    width={width}
                    height={height}
                    data={mapData}
                    selectedSector={selectedSector}
                    clickedCountry={selectedCountry}
                    setCountry={setSelectedCountry}
                    setETR={setSelectedTariff}
                    allETR={allETR}
                    setTooltip={setTooltipContent}
                    initialScroll={initialScroll}
                    setInitialScroll={setInitialScroll}
                />
                <Tooltip
                    x={tooltipContent.x}
                    y={tooltipContent.y}
                    data={tooltipData}
                    isVisible={isTooltipVisible}
                />
                <ExposureCard
                    data={exposureCardData}
                    ref={cardRef}
                    isETR={isETR}
                />
                <SubsectionTitle content={subsectionTitle}/>
                <DescriptionText
                    data={cardMode === "carousel" ? carouselData : selectionCardData}
                    mode={cardMode}
                    isERT={isETR}
                    selectedTariff={selectedTariff}
                    selectedUnits={selectedUnits}
                />
                {
                    cardMode === "carousel" ? (
                        <div>
                            <ToggleButton
                                selected={selectedUnits}
                                setSelected={setSelectedUnits}
                            />
                            <CountryCarousel
                                data={carouselData}
                                isETR={isETR}
                                selectedTariff={selectedTariff}
                                selectedUnits={selectedUnits}
                            />
                        </div>
                    ) : (
                        <SelectionCard
                            data={selectionCardData}
                            historicalData={selectedHistoricalData}
                            mode={cardMode}
                            isETR={isETR}
                            selectedTariff={selectedTariff}
                            showMore={showMore}
                            setShowMore={setShowMore}
                        />
                    )
                }
                <Methodology/>
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