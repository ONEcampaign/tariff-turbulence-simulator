import * as d3 from 'npm:d3';
import * as React from "npm:react";
import {colorPalette} from "./colorPalette.js";
import {riskThresholds} from "./riskThresholds.js";

export function AfricaHexmap({
    width, height, data, clickedCountry, setCountry, setETR, allETR
} = {}) {
    const [hoveredCountry, setHoveredCountry] = React.useState('NONE');
    const svgRef = React.useRef();

    const verticalPadding = 20;

    const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width, height - 2 * verticalPadding], data);
    const path = d3.geoPath().projection(projection);

    const colorScale = d3.scaleThreshold(
        riskThresholds,
        [colorPalette.low, colorPalette.medium, colorPalette.high]
    );

    // Reorder hexes so that clicked hex is above
    const reorderedFeatures = data.features
        .slice()
        .sort((a, b) => {
            const iso3a = a.properties.iso3;
            const iso3b = b.properties.iso3;

            const aIsFocused = iso3a === clickedCountry || iso3a === hoveredCountry;
            const bIsFocused = iso3b === clickedCountry || iso3b === hoveredCountry;

            return aIsFocused - bIsFocused; // draw non-focused first, focused last
        });
    
    return (
        <svg ref={svgRef} width={width} height={height}>
            <g transform={`translate(0, ${verticalPadding})`}>
                {reorderedFeatures.map(feature => {
                    const thisCountryIsClicked = clickedCountry === feature.properties.iso3;
                    return (
                        <path
                            fill={
                                Number.isFinite(feature.properties.etr)
                                    ? colorScale(feature.properties.etr)
                                    : colorPalette.na
                            }
                            opacity={clickedCountry === 'ALL' ? 1 : (thisCountryIsClicked ? 1 : 0.2)}
                            stroke={clickedCountry === 'ALL' ? "white" : (thisCountryIsClicked ? "black" : "white")}
                            stroke-width={"2px"}
                            d={path(feature)}
                            onClick={() => {
                                const iso3 = feature.properties.iso3;
                                const etr = feature.properties.etr;

                                if (clickedCountry === iso3) {
                                    setCountry('ALL');
                                    if (Number.isFinite(allETR)) {
                                        setETR(allETR);
                                    }
                                } else {
                                    setCountry(iso3);
                                    if (Number.isFinite(etr)) {
                                        setETR(etr);
                                    }
                                }
                            }}
                            style={{cursor: "pointer"}}
                        />
                    )
                })}
            </g>
        </svg>
)
}