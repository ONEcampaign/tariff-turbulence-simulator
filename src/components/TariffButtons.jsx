import * as React from "npm:react";

export function TariffButtons({ selectedTariff, selectedIndividualTariff, setIndividualTariff }) {

    return (
        <div className="tariff-buttons-wrapper">
            <button
                className={`tariff-button ${selectedIndividualTariff === "ETR" ? "selected" : ""}`}
                onClick={() => setIndividualTariff("ETR")}
            >
                ETR
            </button>
            <button
                className={`tariff-button ${selectedIndividualTariff !== "ETR" ? "selected" : ""}`}
                onClick={() => setIndividualTariff(selectedTariff)}
            >
                {selectedTariff}%
            </button>
        </div>
    );
}
