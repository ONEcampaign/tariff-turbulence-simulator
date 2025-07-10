// Switch between total impact and per-capita values in the carousel.
import * as React from "npm:react";

export function ToggleButton(
    {
        leftLabel = "Total $",
        rightLabel = "$ per person",
        selected,
        setSelected
    }) {
    const isUsd = selected === "usd";

    const handleClick = () => {
        setSelected(isUsd ? "pc" : "usd");
    };

    return (
        <div className="toggle-buttons-wrapper">
            <h4 className="text-inputs toggle-title">Sort countries by:</h4>
            <div className="toggle-buttons-container">
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
        </div>
    );
}
