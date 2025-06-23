import * as React from "npm:react";

export function ToggleButton({
                                         leftLabel = "sort by $ value",
                                         rightLabel = "sort by % of GDP",
                                         selected,
                                         setSelected
                                     }) {
    const isUsd = selected === "usd";

    const handleClick = () => {
        setSelected(isUsd ? "pct" : "usd");
    };

    return (
        <div className="toggle-wrapper">
            <span className={`toggle-label ${isUsd ? "on" : ""}`}>{leftLabel}</span>
            <button
                className={`toggle-button ${isUsd ? "on" : "off"}`}
                onClick={handleClick}
                aria-pressed={isUsd}
            >
                <div className="toggle-knob" />
            </button>
            <span className={`toggle-label ${isUsd ? "" : "on"}`}>{rightLabel}</span>
        </div>
    );
}
