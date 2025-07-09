import {VizHeader} from "./VizHeader.js";
import {AfricaHexmap} from "./AfricaHexmap.js";
import {Tooltip} from "./Tooltip.js";

import {vizTitle, vizSubtitle} from "../../js/copyText.js";



export function MainViz({
                            mapData,
                            selectedSector,
                            selectedCountry,
                            setSelectedCountry,
                            setSelectedTariff,
                            allETR,
                            setTooltipContent,
                            initialScroll,
                            setInitialScroll,
                            tooltipData,
                            isTooltipVisible,
                            tooltipContent
                        }) {

    // Hexmap dimensions
    const width = 600;
    const height = 600;

    return (
        <div className="viz-wrapper">
            <VizHeader
                title={vizTitle}
                subtitle={vizSubtitle}
            />
            <AfricaHexmap
                width={width}
                height={height}
                data={mapData}
                selectedSector={selectedSector}
                clickedCountry={selectedCountry}
                setCountry={setSelectedCountry}
                setSelectedTariff={setSelectedTariff}
                allETR={allETR}
                setTooltipContent={setTooltipContent}
                initialScroll={initialScroll}
                setInitialScroll={setInitialScroll}
            />
            <Tooltip
                data={tooltipData}
                isVisible={isTooltipVisible}
                x={tooltipContent.x}
                y={tooltipContent.y}
            />
        </div>

    )
}