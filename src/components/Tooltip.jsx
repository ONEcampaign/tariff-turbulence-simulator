export function Tooltip({ x, y, tooltipData, isVisible } ={}) {
    if (!isVisible) return (<div></div>);

    return (
        <div className="tooltip" style={{"left": x, "top": y}}>
            <div className="tooltip-header">
                <span className="tooltip-country-name">{tooltipData.country}</span>
                <span className="tooltip-flag">[flag]</span>
            </div>
            <div className="tooltip-row">
                <span className="tooltip-var-name">Total exposure</span>
                <span className="tooltip-var-value">{tooltipData.impact_usd}</span>
            </div>
            <div className="tooltip-row">
                <span className="tooltip-var-name">% of GDP</span>
                <span className="tooltip-var-value">{tooltipData.impact_pct}</span>
            </div>
        </div>
    )
}