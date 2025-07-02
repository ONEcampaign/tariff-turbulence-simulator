import * as React from "npm:react";

export function ToggleButton(
    {
        leftLabel = "$ value",
        rightLabel = "ETR",
        selected,
        setSelected
    }) {
    const isUsd = selected === "usd";

    const handleClick = () => {
        setSelected(isUsd ? "etr" : "usd");
    };

    return (
        <div className="toggle-buttons-wrapper">
            <h4 className="text-inputs toggle-title">Sort countries by:</h4>
            <span className={`text-toggle-button text-inputs ${isUsd ? "on" : ""}`}>{leftLabel}</span>
            <button
                className={`toggle-button ${isUsd ? "on" : "off"}`}
                onClick={handleClick}
                aria-pressed={isUsd}
            >
                <div className="toggle-knob" />
            </button>
            <span className={`text-toggle-button text-inputs ${isUsd ? "" : "on"}`}>{rightLabel}</span>
        </div>
    );
}
