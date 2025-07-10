// Utility hook that keeps country and sector dropdowns in sync.
export function MutualExclusion({
                                    selectedCountry,
                                    selectedSector,
                                    setSelectedCountry,
                                    setSelectedSector,
                                    crossData,
                                    setSelectedTariff,
                                    setIsETR,
                                    setShowMore,
                                    initialScroll,
                                    setInitialScroll
                                }) {
    const resetTariffToETR = (iso3, sector) => {
        const entry = crossData.find(d => d.iso3 === iso3 && d.sector === sector);
        if (entry?.etr != null) {
            setIsETR(true);
            setSelectedTariff(entry.etr);
        } else {
            setIsETR(true);
            setSelectedTariff(null);
        }
    };

    const updateCountry = (newCountry) => {
        if (newCountry !== "ALL") {
            if (!initialScroll) {
                const card = document.querySelector("#exposure-card");
                if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
                setInitialScroll(true);
            }
            if (selectedSector !== "All sectors") {
                setSelectedSector("All sectors");
            }
        }

        setSelectedCountry(newCountry);

        // Delay until next tick to ensure state updates complete
        setTimeout(() => resetTariffToETR(newCountry, "All sectors"), 0);

        setShowMore(false);
    };

    const updateSector = (newSector) => {
        if (newSector !== "All sectors") {
            if (!initialScroll) {
                const card = document.querySelector("#exposure-card");
                if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
                setInitialScroll(true);
            }
            if (selectedCountry !== "ALL") {
                setSelectedCountry("ALL");
            }
        }

        setSelectedSector(newSector);

        // Delay until next tick to ensure state updates complete
        setTimeout(() => resetTariffToETR("ALL", newSector), 0);

        setShowMore(false);
    };

    return { updateCountry, updateSector };
}
