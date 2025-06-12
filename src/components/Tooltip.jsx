export function Tooltip({ x, y, tooltipData, isVisible } ={}) {
    if (!isVisible) return (<div></div>);

    return (
        <div className="tooltip" style={{"left": x, "top": y}}>
            {`This is a tooltip for ${tooltipData.country}`}
        </div>
    )
}