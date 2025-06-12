import * as React from "npm:react";

export function Slider({ value, setValue, etr = 0 }) {
    const trackRef = React.useRef(null);

    // Get a value based on x position
    const updateValueFromClientX = (clientX) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setValue(Math.round(pct));
    };

    // Start dragging and attach listeners
    const startDrag = (e) => {
        e.preventDefault();

        const handleMouseMove = (e) => {
            updateValueFromClientX(e.clientX);
        };

        const handleMouseUp = () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    };

    const handleTrackClick = (e) => {
        updateValueFromClientX(e.clientX);
    };

    return (
        <div className="slider-wrapper">
            {/* ETR Marker */}
            <div className="slider-marker-etr" style={{ left: `${etr}%` }}>
                <div
                    className="slider-marker-label-etr"
                    onClick={() => setValue(etr)}
                    style={{ cursor: "pointer" }}
                >
                    ETR
                </div>
                <div
                    className="slider-marker-line-etr"
                    onClick={() => setValue(etr)}
                    style={{ cursor: "pointer" }}
                />
            </div>

            {/* Selected Marker */}
            <div className="slider-marker-selected" style={{ left: `${value}%` }}>
                <div
                    className="slider-marker-line-selected"
                    onMouseDown={startDrag}
                    style={{ cursor: "grab" }}
                />
                <div className="slider-marker-label-selected">{value}%</div>
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
                    style={{ left: `${value}%` }}
                />
            </div>
        </div>
    );
}
