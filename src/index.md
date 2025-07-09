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
import {DropdownProvider} from "./components/DropdownContext.js";
import {ControlPanel} from "./components/control-panel/ControlPanel.js";
import {Intro} from "./components/Intro.js";
import {MainViz} from "./components/main-viz/MainViz.js";
import {ExposureCard} from "./components/ExposureCard.js";
import {BottomSection} from "./components/bottom-section/BottomSection.js"
import {Methodology} from "./components/Methodology.js";
import {
    generateCrossData,
    generateMapData,
    generateExposureCardData,
    generateTooltipData,
    generateCarouselData,
    generateSelectionCardData,
    binaryFilter
} from "./js/transformData.js";

const recentData = FileAttachment("./data/africa_exports_to_us_2022_2024_ustrade.csv").csv({typed: true});
const historicalData = FileAttachment("./data/africa_exports_to_us_2002_2023_baci.csv").csv({typed: true});
const geoData = FileAttachment("./data/africa_hexmap.geojson").json({typed: true});
```

```jsx
function App() {
    
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
    const [initialScroll, setInitialScroll] = React.useState(false);

    const cardRef = React.useRef();
    const [showSlider, setShowSlider] = React.useState(false);
    const handleScroll = () => {
        const y = cardRef.current.getBoundingClientRect().top;
        setShowSlider(y <= 100);
    };

    React.useEffect(() => {
        window.addEventListener('scroll', handleScroll, {passive: true});

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Crossed data between csv and geojson to make sure all countries are present
    const crossData = generateCrossData(recentData, geoData)

    React.useEffect(() => {
        if (!isETR) return;

        const entry = crossData.find(d => d.iso3 === selectedCountry && d.sector === selectedSector);
        if (entry?.etr != null) {
            setSelectedTariff(entry.etr);
        }
    }, [isETR, selectedCountry, selectedSector, crossData]);

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
            <ControlPanel
                crossData={crossData}
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
                selectedSector={selectedSector}
                setSelectedSector={setSelectedSector}
                setSelectedTariff={setSelectedTariff}
                selectedTariff={selectedTariff}
                setIsETR={setIsETR}
                isETR={isETR}
                setShowMore={setShowMore}
                initialScroll={initialScroll}
                setInitialScroll={setInitialScroll}
                showSlider={showSlider}
            />
            <div className="main-block">
                <Intro/>
                <MainViz
                    mapData={mapData}
                    selectedSector={selectedSector}
                    selectedCountry={selectedCountry}
                    setSelectedCountry={setSelectedCountry}
                    setSelectedTariff={setSelectedTariff}
                    allETR={allETR}
                    setTooltipContent={setTooltipContent}
                    initialScroll={initialScroll}
                    setInitialScroll={setInitialScroll}
                    tooltipData={tooltipData}
                    isTooltipVisible={isTooltipVisible}
                    tooltipContent={tooltipContent}
                />
                <ExposureCard
                    data={exposureCardData}
                    ref={cardRef}
                    isETR={isETR}
                />
                <BottomSection
                    cardMode={cardMode}
                    carouselData={carouselData}
                    selectionCardData={selectionCardData}
                    selectedHistoricalData={selectedHistoricalData}
                    isETR={isETR}
                    selectedTariff={selectedTariff}
                    selectedUnits={selectedUnits}
                    setSelectedUnits={setSelectedUnits}
                    showMore={showMore}
                    setShowMore={setShowMore}
                />
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