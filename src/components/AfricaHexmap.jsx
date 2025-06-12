import * as d3 from 'npm:d3';
import * as React from "npm:react";


export function AfricaHexmap({
    width, height, data, clickedCountry, onClick
} = {}) {
    const [hoveredCountry, setHoveredCountry] = React.useState('NONE');
    const svgRef = React.useRef();

    const verticalPadding = 20;

    const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width, height - 2 * verticalPadding], data);
    const path = d3.geoPath().projection(projection);

    const colorPalette = {
        low: "#9ACACD",
        medium: "#4DAEB4",
        high: "#17858C",
        na: "#F8F7F8"
    }

    const exposureValues = data.features
        .map(d => d.properties.exposure_pct)
        .filter(d => Number.isFinite(d));
    const minVal = d3.min(exposureValues);
    const maxVal = d3.max(exposureValues);

    console.log(data)
    console.log(minVal)
    console.log(exposureValues)

    const colorScale = d3.scaleLinear()
        .domain([minVal, maxVal])
        .range([colorPalette.low, colorPalette.high]);

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
                                Number.isFinite(feature.properties.exposure_pct)
                                    ? colorScale(feature.properties.exposure_pct)
                                    : colorPalette.na
                            }
                            stroke={clickedCountry === 'ALL' ? "white" : (thisCountryIsClicked ? "black" : "white")}
                            stroke-width={"2px"}
                            d={path(feature)}
                            onClick={() => {
                                if (thisCountryIsClicked) {
                                    onClick('ALL');
                                } else {
                                    onClick(feature.properties.iso3);
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