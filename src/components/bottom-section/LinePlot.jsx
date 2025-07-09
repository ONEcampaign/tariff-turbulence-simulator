// Minimal line chart used in the selection card for historical exports.
import * as React from "npm:react";
import * as d3 from "npm:d3";

export function LinePlot({ data, height = 100 }) {
    const ref = React.useRef(null);
    const [svgWidth, setSvgWidth] = React.useState(600); // Fallback width

    React.useEffect(() => {
        if (ref.current) {
            const resize = () => setSvgWidth(ref.current.clientWidth);
            resize(); // Initial
            window.addEventListener("resize", resize);
            return () => window.removeEventListener("resize", resize);
        }
    }, []);

    const years = data.map(d => d.year);
    const values = data.map(d => d.value);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const margin = {
        vertical: 10,
        horizontal: 50,
    }

    const x = d3.scaleLinear().domain([minYear, maxYear]).range([margin.horizontal, svgWidth - margin.horizontal]);
    const y = d3.scaleLinear().domain([minValue, maxValue]).range([height - margin.vertical, margin.vertical]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));

    return (
        <div
            className="card-row selection-card-row"
            style={{maxWidth: "400px"}}
        >
            <h4 className="text-support-medium">
                Historical exports
            </h4>
            <div ref={ref} style={{width: "100%"}}>
                <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`}>
                    <path
                        d={line(data)}
                        fill="none"
                        stroke="black"
                        strokeWidth="1.5"
                    />
                    <circle
                        cx={x(minYear)}
                        cy={y(data.find(d => d.year === minYear).value)}
                        r={3}
                        fill="black"
                    />
                    <circle
                        cx={x(maxYear)}
                        cy={y(data.find(d => d.year === maxYear).value)}
                        r={3}
                        fill="black"
                    />
                    <text
                        className="text-support-small"
                        x={x(minYear) - 5}
                        y={y(data.find(d => d.year === minYear).value)}
                        textAnchor="end"
                        dy="6"
                        dx="-6"
                    >
                        {minYear}
                    </text>
                    <text
                        className="text-support-small"
                        x={x(maxYear) + 5}
                        y={y(data.find(d => d.year === maxYear).value)}
                        textAnchor="start"
                        dy="6"
                        dx="6"
                    >
                        {maxYear}
                    </text>
                </svg>
            </div>

        </div>
    );
}
