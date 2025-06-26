import * as d3 from 'npm:d3';
import * as React from "npm:react";
import {colorPalette} from "../js/colorPalette.js";
import {riskThresholds} from "../js/riskThresholds.js";

export function AfricaHexmap({
                                 width,
                                 height,
                                 data,
                                 clickedCountry,
                                 setCountry,
                                 setETR,
                                 allETR,
                                 setTooltip
} = {}) {
    const [hoveredCountry, setHoveredCountry] = React.useState('NONE');
    const svgRef = React.useRef();

    const verticalPadding = 20;
    const marginBottom = 240;

    const projection = d3.geoIdentity()
        .reflectY(true)
        .fitSize([width, height - 2 * verticalPadding], data);
    const path = d3.geoPath().projection(projection);

    const colorScale = d3.scaleThreshold(
        riskThresholds,
        [colorPalette.veryLow, colorPalette.low, colorPalette.medium, colorPalette.high]
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
            <defs>
                <pattern
                    id="diagonalHatch"
                    patternUnits="userSpaceOnUse"
                    width="6"
                    height="6"
                    patternTransform="rotate(45)"
                >
                    <rect width="6" height="6" fill={colorPalette.na} />
                    <line x1="0" y1="0" x2="0" y2="6" stroke={colorPalette.naHatch} strokeWidth="3" />
                </pattern>
            </defs>
            <g transform={`translate(0, ${verticalPadding})`}>
                {reorderedFeatures.map(feature => {
                    const thisCountryIsClicked = clickedCountry === feature.properties.iso3;
                    return (
                        <path
                            fill={
                                Number.isFinite(feature.properties.etr)
                                    ? colorScale(feature.properties.etr)
                                    : "url(#diagonalHatch)"
                            }
                            opacity={clickedCountry === 'ALL' ? 1 : (thisCountryIsClicked ? 1 : 0.2)}
                            stroke={
                                hoveredCountry === feature.properties.iso3
                                    ? "black"
                                    : (clickedCountry === 'ALL'
                                        ? "white"
                                        : (thisCountryIsClicked ? "black" : "white"))
                            }
                            strokeWidth={"2px"}
                            d={path(feature)}
                            onClick={() => {
                                const iso3 = feature.properties.iso3;
                                const etr = feature.properties.etr;

                                if (etr != null) {
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
                                }
                            }}
                            onMouseMove={(event) => {
                                if (clickedCountry === "ALL") {
                                    setTooltip({
                                        x: event.pageX,
                                        y: event.clientY + marginBottom > window.innerHeight ? 
                                            event.pageY - 150 - marginBottom : event.pageY - 100,
                                        iso3: feature.properties.iso3
                                    });
                                }
                            }}
                            onMouseEnter={() => setHoveredCountry(feature.properties.iso3)}
                            onMouseLeave={() => setHoveredCountry(null)}
                            onMouseOut={() => {
                                setTooltip({x: null, y: null, country: null});
                            }}
                            style={{cursor: "pointer"}}
                        />
                    )
                })}
            </g>
        </svg>
    )
}