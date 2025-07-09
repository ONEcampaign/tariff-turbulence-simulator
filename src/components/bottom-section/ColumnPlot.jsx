import * as React from "npm:react";
import * as d3 from "npm:d3";
import { formatCurrency } from "../../js/format.js";
import { colorPalette } from "../../js/colorPalette.js";

const getChunks = (array, chunkSize) => {
    return Array(Math.ceil(array.length / chunkSize)).fill()
    .map((_, index) => index * chunkSize)
    .map(begin => array.slice(begin, begin + chunkSize))
};                                                                                              

export function ColumnPlot({ data, mode, showMore, chunkSize }) {

    const isCountryMode = mode === "country";

    const varName = isCountryMode ? "sector" : "country"

    const containerRef = React.useRef(null);
    const [width, setWidth] = React.useState(0);

    const height = 180;
    const margin = { top: 10, right: 0, bottom: 0, left: 0 };

    // Track container width for responsiveness
    React.useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            const newWidth = entries[0].contentRect.width;
            setWidth(newWidth);
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    // Early return if no width yet
    if (width === 0) return <div ref={containerRef} style={{ width: "100%" }} />;

    // Chunks
    const dataChunks = showMore ? getChunks(data, chunkSize) : [data.slice(0, chunkSize)];

    // Scales
    const xScale = d3
        .scaleBand()
        .domain(d3.range(chunkSize))
        .range([margin.left, width - margin.right])
        .paddingInner(0.1)
        .paddingOuter(0);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.impact_usd)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    return (
        <div
            className="selection-card-chart"
            ref={containerRef}
            style={{ position: "relative", width: "100%" }}
        >
            <h4 className="text-support-medium">Most exposed {isCountryMode ? "sectors" : "countries"}</h4>
            {dataChunks.map(chunk => 
                <ColumnChartRow
                    data={chunk}
                    width={width}
                    height={height}
                    varName={varName}
                    xScale={xScale}
                    yScale={yScale}
                    margin={margin}
                    isCountryMode={isCountryMode}
                />
            )}
                
        </div>
    );
}

function ColumnChartRow({ data, width, height, varName, xScale, yScale, margin, isCountryMode }) {

    return (
        <div>
            <svg width={width} height={height}>
                <g>
                    {data.map((d,i) => {
                        const barHeight = yScale(0) - yScale(d.impact_usd);
                        const fitsInside = barHeight > 25;
                        return (
                            <g key={d[varName]}>
                                <rect
                                    x={xScale(i)}
                                    y={yScale(d.impact_usd)}
                                    width={xScale.bandwidth()}
                                    height={barHeight}
                                    fill={isCountryMode ? colorPalette.countryMode : colorPalette.sectorMode}
                                />
                                <text
                                    className="column-plot-value text-support-medium"
                                    x={xScale(i) + xScale.bandwidth() / 2}
                                    y={
                                        fitsInside
                                            ? yScale(d.impact_usd) + barHeight / 2
                                            : yScale(d.impact_usd) - 10
                                    }
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="black"
                                >
                                    {formatCurrency(d.impact_usd)}
                                </text>
                            </g>
                        );
                    })}
                </g>
            </svg>

            {/* HTML labels below bars */}
            <div
                style={{
                    position: "relative",
                    bottom: 0,
                    left: margin.left,
                    right: margin.right,
                    height: "auto",
                    display: "flex",
                    gap: `${xScale.step() - xScale.bandwidth()}px`,
                    pointerEvents: "none",
                }}
            >
                {data.map((d) => (
                    <div
                        key={d[varName]}
                        className="column-plot-label text-support-medium"
                        style={{ width: `${xScale.bandwidth()}px` }}
                    >
                        {d[varName]}
                    </div>
                ))}
            </div>
        </div>
    )
}