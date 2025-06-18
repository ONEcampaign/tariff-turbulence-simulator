import * as React from "npm:react";

export function Slider({ selectedTariff, setSelectedTariff, selectedIndividualTariff, setSelectedIndividualTariff,  etr = 0 }) {
    const trackRef = React.useRef(null);

    // Get a selectedTariff based on x position
    const updateselectedTariffFromClientX = (clientX) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSelectedTariff(Math.round(pct));
        if (selectedIndividualTariff !== "ETR") {
            setSelectedIndividualTariff(Math.round(pct));
        }
    };

    // Start dragging and attach listeners
    const startDrag = (e) => {
        e.preventDefault();

        const handleMouseMove = (e) => {
            updateselectedTariffFromClientX(e.clientX);
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleTrackClick = (e) => {
        updateselectedTariffFromClientX(e.clientX);
    };

    return (
        <div className="slider-wrapper">
            {/* ETR Marker */}
            <div className="slider-marker-etr" style={{ left: `${etr}%` }}>
                <div
                    className="slider-marker-label-etr"
                    onClick={() => {
                        setSelectedTariff(etr);
                        if (selectedIndividualTariff !== "ETR") {
                            setSelectedIndividualTariff(etr);
                        }
                    }}
                    style={{ cursor: "pointer" }}
                >
                    ETR
                </div>
                <div
                    className="slider-marker-line-etr"
                    onClick={() => {
                        setSelectedTariff(etr);
                        if (selectedIndividualTariff !== "ETR") {
                            setSelectedIndividualTariff(etr);
                        }
                    }}
                    style={{ cursor: "pointer" }}
                />
            </div>

            {/* Selected Marker */}
            <div className="slider-marker-selected" style={{ left: `${selectedTariff}%` }}>
                <div
                    className="slider-marker-line-selected"
                    onMouseDown={startDrag}
                    style={{ cursor: "grab" }}
                />
                <div className="slider-marker-label-selected">{selectedTariff}%</div>
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
                    style={{ left: `${selectedTariff}%` }}
                />
            </div>
        </div>
    );
}
