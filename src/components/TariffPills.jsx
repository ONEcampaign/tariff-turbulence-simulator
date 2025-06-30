import * as React from "npm:react";
import { formatPercentage } from "../js/format.js";

export function TariffPills({ isETR, selectedTariff }) {
    const displayLabel = isETR ? "ETR" : formatPercentage(selectedTariff, {});

    return (
        <div className="tariff-pills-wrapper">
            <div className="tariff-pill display text-support-small">
                {displayLabel}
            </div>

            <div className="tariff-pill-tooltip-wrapper">
                <div className="tariff-pill hover text-support-small">
                    Edit
                </div>
                <div className="tariff-pill-tooltip">
                    <p className="text-support-small">
                        Use the slider to adjust individual tariffs.
                    </p>
                    <p className="text-support-small">
                        ETR sets the simulated tariff to the effective tariff rate of each country and sector.
                    </p>
                    <p className="text-support-small">
                        Any other tariff simulates the same tariff for each country/sector.
                    </p>

                </div>
            </div>
        </div>
    );
}
