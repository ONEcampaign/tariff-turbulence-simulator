import * as d3 from "npm:d3";
import * as React from "npm:react";
import { formatPercentage } from "../js/format.js";
import { colorPalette } from "../js/colorPalette.js";
import { riskThresholds } from "../js/riskThresholds.js";

export function AfricaHexmap(
    {
        width,
        height,
        data,
        selectedSector,
        clickedCountry,
        setCountry,
        setETR,
        allETR,
        setTooltip
    } = {}) {

    const [hoveredCountry, setHoveredCountry] = React.useState('NONE');
    const svgRef = React.useRef();
    const wrapperRef = React.useRef();

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

    // Reorder hexes so that clicked or hovered hexes appear on top
    const reorderedFeatures = data.features
        .slice()
        .sort((a, b) => {
            const iso3a = a.properties.iso3;
            const iso3b = b.properties.iso3;
            const aIsFocused = iso3a === clickedCountry || iso3a === hoveredCountry;
            const bIsFocused = iso3b === clickedCountry || iso3b === hoveredCountry;
            return aIsFocused - bIsFocused;
        });

    // Handle clicks outside the wrapper to reset country
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                clickedCountry !== "ALL"
            ) {
                setCountry("ALL");
                if (Number.isFinite(allETR)) {
                    setETR(allETR);
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [clickedCountry, setCountry, setETR, allETR]);

    return (
        <div ref={wrapperRef}
             style={{ display: "inline-block", width: "fit-content", height: "fit-content" }}
        >
            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                onClick={(event) => {
                    // Reset if click target is the <svg> or the <g> but not a <path>
                    if (
                        clickedCountry !== "ALL" &&
                        event.target instanceof SVGElement &&
                        event.target.tagName !== "path"
                    ) {
                        setCountry("ALL");
                        if (Number.isFinite(allETR)) {
                            setETR(allETR);
                        }
                    }
                }}
            >
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
                        const iso3 = feature.properties.iso3;
                        const thisCountryIsClicked = clickedCountry === iso3;
                        const etr = feature.properties.etr;

                        return (
                            <path
                                key={iso3}
                                fill={
                                    Number.isFinite(etr)
                                        ? colorScale(formatPercentage(etr, { tariff: true, display: false }))
                                        : "url(#diagonalHatch)"
                                }
                                opacity={clickedCountry === "ALL" ? 1 : (thisCountryIsClicked ? 1 : 0.2)}
                                stroke={
                                    hoveredCountry === iso3
                                        ? "black"
                                        : (clickedCountry === "ALL"
                                            ? "white"
                                            : (thisCountryIsClicked ? "black" : "white"))
                                }
                                strokeWidth="2px"
                                d={path(feature)}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent svg-level click reset
                                    const iso3 = feature.properties.iso3;
                                    const etr = feature.properties.etr;

                                    if (selectedSector === "All sectors" && etr != null) {
                                        if (clickedCountry === iso3) {
                                            setCountry("ALL");
                                            if (Number.isFinite(allETR)) {
                                                setETR(allETR);
                                            }
                                        } else {
                                            setCountry(iso3);
                                            if (Number.isFinite(etr)) {
                                                setETR(etr);
                                            }

                                            // Scroll to #exposure-card
                                            const target = document.querySelector("#exposure-card");
                                            if (target) {
                                                target.scrollIntoView({ behavior: "smooth", block: "start" });
                                            }
                                        }
                                    }
                                }}
                                onMouseMove={(event) => {
                                    if (clickedCountry === "ALL") {
                                        setTooltip({
                                            x: event.pageX,
                                            y: event.clientY + marginBottom > window.innerHeight
                                                ? event.pageY - marginBottom
                                                : event.pageY - 50,
                                            iso3: iso3
                                        });
                                    }
                                }}
                                onMouseEnter={() => {
                                    if (clickedCountry === "ALL") {
                                        setHoveredCountry(iso3)
                                    }
                                }}
                                onMouseLeave={() => setHoveredCountry(null)}
                                onMouseOut={() => setTooltip({ x: null, y: null, country: null })}
                                style={{ cursor: "pointer" }}
                            />
                        );
                    })}
                </g>
            </svg>
        </div>
    );
}
