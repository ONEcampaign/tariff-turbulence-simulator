import * as React from "npm:react";

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
                {selectedTariff}%
            </button>
        </div>
    );
}
