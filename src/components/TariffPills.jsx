import * as React from "npm:react";
import { formatPercentage } from "../js/format.js";

export function TariffPills({ isETR, selectedTariff }) {
    const displayLabel = isETR ? "ETR" : formatPercentage(selectedTariff, {});
    const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth <= 768);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const wrapperRef = React.useRef(null);

    React.useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };

        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setShowTooltip(false);
            }
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        document.addEventListener("click", handleClickOutside);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const handleClick = () => {
        if (isSmallScreen) {
            setShowTooltip(prev => !prev);
        }
    };

    return (
        <div className="tariff-pills-wrapper">
            <div className="tariff-pill display text-support-small">
                {displayLabel}
            </div>

            <div
                className="tariff-pill-tooltip-wrapper"
                onClick={handleClick}
                ref={wrapperRef}
            >
                <div className="tariff-pill hover text-support-small">
                    Edit
                </div>
                <div
                    className={`tariff-pill-tooltip ${
                        showTooltip ? "visible-tooltip" : ""
                    }`}
                >
                    <p className="text-support-small">
                        Use the slider to adjust individual tariffs.
                    </p>
                    <p className="text-support-small">
                        ETR sets country- and sector-specific effective tariff rates.
                    </p>
                    <p className="text-support-small">
                        Any other tariff simulates the same tariff for all countries/sectors.
                    </p>
                </div>
            </div>
        </div>
    );
}
