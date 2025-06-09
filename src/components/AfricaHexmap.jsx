import * as d3 from 'npm:d3';
import * as React from "npm:react";


export function AfricaHexmap({
    width, height, data, clickedCountry, onClick
} = {}) {
    const [hoveredCountry, setHoveredCountry] = React.useState('NONE');

    const projection = d3.geoIdentity().reflectY(true).fitSize([width, height], data);
    const path = d3.geoPath().projection(projection);
    const opacity = 0.4;

    // TODO: 
    
    return (
        <svg width={width} height={height}>
            {data.features.map(feature => {
                const thisCountryIsClicked = clickedCountry === feature.properties.iso3;
                return (
                    <path
                        fill={"lightgray"}
                        stroke={"white"}
                        stroke-width={"2px"}
                        opacity={clickedCountry === 'All' ? 1 : (thisCountryIsClicked ? 1 : opacity)}
                        d={path(feature)}
                        onClick={() => {
                            if (thisCountryIsClicked) {
                                onClick('All');
                            } else {
                                onClick(feature.properties.iso3);
                            }
                        }}
                    />
                )
            })}
        </svg>
    )
}