import * as React from "npm:react";

// Utility to update both country and sector in a controlled way
export function MutualExclusion({
                                    selectedCountry,
                                    selectedSector,
                                    setSelectedCountry,
                                    setSelectedSector,
                                    crossData,
                                    setSelectedTariff,
                                    isETR,
                                    setShowMore,
                                    initialScroll,
                                    setInitialScroll
}) {
    const updateCountry = (newCountry) => {
        if (newCountry !== "ALL") {
            // Scroll to exposure card
            if (!initialScroll) {
                const card = document.querySelector("#exposure-card");
                if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                setInitialScroll(true);
            }
            if (selectedSector !== "All sectors") {
                setSelectedSector("All sectors");
            }
        }

        setSelectedCountry(newCountry);
        setShowMore(false);
    };

    const updateSector = (newSector) => {
        if (newSector !== "All sectors") {
            // Scroll to exposure card
            if (!initialScroll) {
                const card = document.querySelector("#exposure-card");
                if (card) {
                    card.scrollIntoView({ behavior: "smooth", block: "start" });
                }
                setInitialScroll(true);
            }
            if (selectedCountry !== "ALL") {
                setSelectedCountry("ALL");
            }
        }
        setSelectedSector(newSector);
        setShowMore(false);
    };

    // Sync ETR whenever the [selectedCountry, selectedSector] combo changes
    React.useEffect(() => {
        if (!isETR) return;

        const entry = crossData.find(d => d.iso3 === selectedCountry && d.sector === selectedSector);
        if (entry?.etr != null) {
            setSelectedTariff(entry.etr);
        } else {
            setSelectedTariff(null); // fallback if no data available
        }
    }, [selectedCountry, selectedSector, crossData]);

    return { updateCountry, updateSector };
}