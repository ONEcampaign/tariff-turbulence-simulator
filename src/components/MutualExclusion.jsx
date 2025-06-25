import * as React from "npm:react";

// Utility to update both country and sector in a controlled way
export function MutualExclusion({
                                    selectedCountry,
                                    selectedSector,
                                    setSelectedCountry,
                                    setSelectedSector,
                                    crossData,
                                    setSelectedTariff,
                                    isManualTariff
}) {
    const updateCountry = (newCountry) => {
        if (newCountry !== "ALL" && selectedSector !== "All products") {
            setSelectedSector("All products");
        }
        setSelectedCountry(newCountry);
    };

    const updateSector = (newSector) => {
        if (newSector !== "All products" && selectedCountry !== "ALL") {
            setSelectedCountry("ALL");
        }
        setSelectedSector(newSector);
    };

    // Sync ETR whenever the [selectedCountry, selectedSector] combo changes
    React.useEffect(() => {
        if (isManualTariff) return;

        const entry = crossData.find(d => d.iso3 === selectedCountry && d.product === selectedSector);
        if (entry?.etr != null) {
            setSelectedTariff(Math.round(entry.etr * 100));
        } else {
            setSelectedTariff(null); // fallback if no data available
        }
    }, [selectedCountry, selectedSector, crossData]);

    return { updateCountry, updateSector };
}