import * as React from "npm:react";
import {ChevronDown} from "./ChevronDown.js";
import {Dropdown} from "./Dropdown.js";
import {Slider} from "./Slider.js";
import {MutualExclusion} from "./MutualExclusion.js";
import {
    generateCountryEntries,
    generateSectorGroups
} from "../js/transformData.js";



export function ControlPanel({
                                 crossData,
                                 selectedCountry,
                                 setSelectedCountry,
                                 selectedSector,
                                 setSelectedSector,
                                 setSelectedTariff,
                                 selectedTariff,
                                 setIsETR,
                                 isETR,
                                 setShowMore,
                                 initialScroll,
                                 setInitialScroll,
                                 setUserSetTariff,
                                 showSlider
}) {

    const {
        updateCountry,
        updateSector
    } = MutualExclusion({
        selectedCountry,
        setSelectedCountry,
        selectedSector,
        setSelectedSector,
        crossData,
        setSelectedTariff,
        setIsETR,
        setShowMore,
        initialScroll,
        setInitialScroll
    });

    const [hideMenu, setHideMenu] = React.useState(false);
    const stickyRef = React.useRef(null);
    const [stickyBottom, setStickyBottom] = React.useState(0);

    React.useEffect(() => {
        if (!hideMenu || !stickyRef.current) return;

        const wrapper = stickyRef.current;
        const tabHeight = wrapper.querySelector(".show-hide-tab")?.offsetHeight ?? 0;
        const fullHeight = wrapper.scrollHeight;

        setStickyBottom(fullHeight - tabHeight);
    }, [hideMenu, showSlider]);

    const selectedData = crossData.find(
        d => d.iso3 === selectedCountry && d.sector === selectedSector
    );

    // Generate iso3-country name map for dropdown menu
    const countryEntries = generateCountryEntries(crossData);
    const countryMap = Object.fromEntries(countryEntries);

    // Generate a list of unique sector groups fro dropdown menu
    const sectorGroups = generateSectorGroups(crossData);

    return (
        <div
            ref={stickyRef}
            className={`sticky-wrapper ${hideMenu ? "hidden" : ""}`}
            style={{
                bottom: hideMenu ? `-${stickyBottom + 5 }px` : "0px",
                transition: "bottom 0.5s ease-in-out"
            }}
        >
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
                <div
                    className={`slider-opacity-container ${showSlider ? "" : "hidden"}`}
                >
                    <div className="controls-separator"></div>
                    <h4 className="text-support-medium extra-margin"><b>Adjust</b> the tariff</h4>
                    <Slider
                        selectedTariff={selectedTariff ?? 0}
                        setSelectedTariff={setSelectedTariff}
                        isETR={isETR}
                        setIsETR={setIsETR}
                        etr={Number.isFinite(selectedData.etr) ? selectedData.etr : null}
                        setUserSetTariff={setUserSetTariff}
                    />
                </div>
            </div>
        </div>
    )

}