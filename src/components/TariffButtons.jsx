import * as React from "npm:react";
import { formatPercentage } from "../js/format.js";

export function TariffButtons({
                                  selectedTariff,
                                  isETR,
                                  editMode,
                                  setEditMode,
                              }) {
    const [displayLabel, setDisplayLabel] = React.useState(
        isETR ? "ETR" : formatPercentage(selectedTariff, {})
    );

    React.useEffect(() => {
        if (editMode) {
            setDisplayLabel(isETR ? "ETR" : formatPercentage(selectedTariff, {}));
        }
    }, [editMode, selectedTariff, isETR]);

    return (
        <div className="tariff-buttons-wrapper ">
            <div className="tariff-bubble text-support-small">
                {displayLabel}
            </div>
            <button
                className="tariff-button text-support-small"
                onClick={() => setEditMode(!editMode)}
            >
                {editMode ? "Apply" : "Edit"}
            </button>
        </div>
    );
}
