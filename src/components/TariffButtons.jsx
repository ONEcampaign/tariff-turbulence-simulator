import * as React from "npm:react";
import { formatPercentage } from "../js/format.js";

export function TariffButtons({ selectedTariff, selectedIndividualTariff, setSelectedIndividualTariff }) {

    return (
        <div className="tariff-buttons-wrapper">
            <button
                className={`tariff-button text-support-small ${selectedIndividualTariff === "ETR" ? "selected" : ""}`}
                onClick={() => setSelectedIndividualTariff("ETR")}
            >
                ETR
            </button>
            <button
                className={`tariff-button text-support-small ${selectedIndividualTariff !== "ETR" ? "selected" : ""}`}
                onClick={() => setSelectedIndividualTariff(selectedTariff)}
            >
                {formatPercentage(selectedTariff, {})}
            </button>
        </div>
    );
}
