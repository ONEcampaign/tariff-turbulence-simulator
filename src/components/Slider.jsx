import * as React from "npm:react";

import { formatPercentage } from "../js/format.js";


export function Slider({
                           selectedTariff, // number between 0 and 1
                           setSelectedTariff,
                           isETR,
                           setIsETR,
                           etr,
                           setUserSetTariff
                       }) {
    const trackRef = React.useRef(null);

    // Convert clientX to a 0–1 number
    const updateselectedTariffFromClientX = (clientX) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const tariffValue = (pct / 100)

        setSelectedTariff(tariffValue);
    };

    const startDrag = (e) => {
        e.preventDefault();

        const handleMouseMove = (e) => {
            updateselectedTariffFromClientX(e.clientX);
            setIsETR(false);
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const startTouch = (e) => {
        e.preventDefault();

        const handleMouseMove = (e) => {
            updateselectedTariffFromClientX(e.touches[0].clientX);
            setIsETR(false);
        };

        const handleMouseUp = () => {
            window.removeEventListener("touchmove", handleMouseMove);
            window.removeEventListener("touchend", handleMouseUp);
        };

        window.addEventListener("touchmove", handleMouseMove);
        window.addEventListener("touchend", handleMouseUp);
    }

    const handleTrackClick = (e) => {
        updateselectedTariffFromClientX(e.clientX);
        setIsETR(false);
    };

    return (
        <div className="slider-wrapper">
            {/* ETR Marker */}
            <div className="slider-marker-etr" style={{ left: `${etr * 100}%` }}>
                <div
                    className="slider-marker-label-etr text-support-medium"
                    onClick={() => {
                        setSelectedTariff(etr);
                        setIsETR(true);
                        setUserSetTariff(false);
                    }}
                    style={{ cursor: "pointer" }}
                >
                    ETR
                </div>
                <div
                    className="slider-marker-line-etr"
                    onClick={() => {
                        setSelectedTariff(etr);
                        setIsETR(true);
                        setUserSetTariff(false);
                    }}
                    style={{ cursor: "pointer" }}
                />
            </div>

            {/* Selected Marker */}
            <div className="slider-marker-selected" style={{ left: `${selectedTariff * 100}%` }}>
                <div
                    className="slider-marker-line-selected"
                    onMouseDown={startDrag}
                    onTouchStart={startTouch}
                    style={{ cursor: "grab" }}
                />
                <div className="slider-marker-label-selected text-support-medium">
                    {formatPercentage(selectedTariff,{})}
                </div>
            </div>

            {/* Track */}
            <div
                className="slider-track"
                ref={trackRef}
                onClick={handleTrackClick}
            >
                <div className="slider-track-base" />
                <div
                    className="slider-track-overlay"
                    style={{ left: `${selectedTariff * 100}%` }}
                />
            </div>
        </div>
    );
}
