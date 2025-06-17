import * as React from "npm:react";
import * as d3 from "npm:d3";
import { formatCurrency } from "../js/format.js";
import { colorPalette } from "../js/colorPalette.js";

export function BarChart({ data }) {
    const containerRef = React.useRef(null);
    const [width, setWidth] = React.useState(0);

    const height = 180;
    const margin = { top: 10, right: 0, bottom: 40, left: 0 };

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

    // Scales
    const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.product))
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
            className="single-country-card-chart"
            ref={containerRef}
            style={{ position: "relative", width: "100%" }}
        >
            <h4 className="single-country-card-chart-title">Most exposed sectors</h4>
            <svg width={width} height={height}>
                <g>
                    {data.map((d) => {
                        const barHeight = yScale(0) - yScale(d.impact_usd);
                        const fitsInside = barHeight > 24;
                        return (
                            <g key={d.product}>
                                <rect
                                    x={xScale(d.product)}
                                    y={yScale(d.impact_usd)}
                                    width={xScale.bandwidth()}
                                    height={barHeight}
                                    fill={colorPalette.columns}
                                />
                                <text
                                    className="bar-value"
                                    x={xScale(d.product) + xScale.bandwidth() / 2}
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
                    position: "absolute",
                    bottom: 0,
                    left: margin.left,
                    right: margin.right,
                    height: "40px",
                    display: "flex",
                    gap: `${xScale.step() - xScale.bandwidth()}px`,
                    justifyContent: "space-between",
                    pointerEvents: "none",
                }}
            >
                {data.map((d) => (
                    <div
                        key={d.product}
                        className="bar-label"
                        style={{ width: `${xScale.bandwidth()}px` }}
                    >
                        {d.product}
                    </div>
                ))}
            </div>
        </div>
    );
}