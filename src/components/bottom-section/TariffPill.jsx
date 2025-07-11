// Small pill on tariff-cards showing the active tariff value with tooltip on hover/press.
import * as React from "npm:react";
import { formatPercentage } from "../../js/format.js";

export function TariffPill({ isETR, selectedTariff, mode, individualTariff = null }) {

    const [isSmallScreen, setIsSmallScreen] = React.useState(window.innerWidth <= 768);
    const [showTooltip, setShowTooltip] = React.useState(false);
    const wrapperRef = React.useRef(null);

    let displayLabel;
    if (mode === "carousel") {
        displayLabel = isETR ? individualTariff : formatPercentage(selectedTariff, {});
    } else {
        displayLabel = isETR ? "ETR" : formatPercentage(selectedTariff, {});
    }

    const isMenuCollapsible = window.innerWidth <= 1120;

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
            <div
                className="tariff-pill-tooltip-wrapper"
                onClick={handleClick}
                ref={wrapperRef}
            >
                <div className="tariff-pill text-support-small">
                    {displayLabel}
                </div>
                <div
                    className={`tariff-pill-tooltip ${
                        showTooltip ? "visible-tooltip" : ""
                    }`}
                >
                    <p className="text-support-small">
                        Adjust the tariff with the slider {isMenuCollapsible ? "in the controls tab" : "to the left"}.
                    </p>
                </div>
            </div>
        </div>
    );
}
