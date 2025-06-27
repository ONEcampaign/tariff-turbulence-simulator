import {
    formatTariff,
    computeImpactUSD,
    computeImpactPCT
} from "./format.js";

export function generateCrossData(data, geoData) {
    const sectors = Array.from(new Set(data.map(d => d.sector)));
    const dataKeys = new Set(data.flatMap(d => Object.keys(d)));
    dataKeys.add("iso2");

    const iso2to3 = Object.fromEntries(
        geoData.features
            .map(f => [f.properties.iso2, f.properties.iso3])
            .filter(([iso2, iso3]) => iso2 && iso3)
    );

    const countries = geoData.features.map(f => ({
        iso3: f.properties.iso3,
        iso2: f.properties.iso2,
        country: f.properties.country
    }));

    const dataMap = new Map(data.map(d => [`${d.iso3}|${d.sector}`, d]));

    const crossData = [];

    for (const { iso3, iso2, country } of countries) {
        for (const sector of sectors) {
            const keyIso3 = `${iso3}|${sector}`;
            const keyIso2 = `${iso2}|${sector}`;
            const existing = dataMap.get(keyIso3) || dataMap.get(keyIso2);

            if (existing) {
                crossData.push({
                    ...existing,
                    iso2,
                    iso3,
                    country,
                    sector
                });
            } else {
                const row = {};
                for (const k of dataKeys) row[k] = null;
                row.iso3 = iso3;
                row.iso2 = iso2;
                row.country = country;
                row.sector = sector;
                crossData.push(row);
            }
        }
    }

    for (const d of data) {
        if (d.iso3 === "ALL") {
            crossData.push({
                ...d,
                iso2: null
            });
        }
    }

    return crossData;
}

export function generateMapData(data, geoData, clickedSector) {
    return {
        type: "FeatureCollection",
        features: geoData.features.map(feat => {
            const iso3 = feat.properties.iso3;
            const row = data.find(d => d.iso3 === iso3 && d.sector === clickedSector);

            return {
                ...feat,
                properties: {
                    ...feat.properties,
                    etr: formatTariff(row?.etr)
                }
            };
        })
    };
}

export function generateCountryEntries(crossData) {
    return Array.from(
        new Map(crossData.map(d => [d.iso3, d.country])).entries()
    ).sort((a, b) => {
        if (a[1] === "All countries") return -1;
        if (b[1] === "All countries") return 1;
        return a[1].localeCompare(b[1]);
    });
}

export function generateSectorGroups(crossData) {
    return Array.from(
        new Set(crossData.map(d => d.sector))
    ).sort((a, b) => {
        if (a === "All sectors") return -1;
        if (b === "All sectors") return 1;
        return a.localeCompare(b);
    });
}

export function generateExposureCardData(selectedData, selectedTariff) {
    const impact_usd = computeImpactUSD(selectedData.exports, selectedTariff);

    return {
        country: selectedData.country === "All countries"
            ? "all countries"
            : selectedData.country,
        sector: selectedData.sector.toLowerCase(),
        tariff: selectedTariff,
        exports: selectedData.exports,
        impact_usd: impact_usd
    };
}

export function generateTooltipData(hoveredData) {

    const impactUsd = computeImpactUSD(hoveredData?.exports, hoveredData?.etr);
    const impactPct = computeImpactPCT(hoveredData?.exports, hoveredData?.etr, hoveredData?.gdp);

    return {
        country: hoveredData?.country === "All countries"
            ? "all countries"
            : hoveredData?.country,
        iso2: hoveredData?.iso2 ?? null,
        sector: hoveredData?.sector?.toLowerCase(),
        etr: hoveredData?.etr,
        exports: hoveredData?.exports,
        impact_usd: impactUsd,
        impact_pct: impactPct
    };
}

export function generateCarouselData(data, selectedSector, selectedIndividualTariff) {
    return data
        .filter(d => d.sector === selectedSector && d.country !== "All countries")
        .map(d => {
            const tariff = selectedIndividualTariff === "ETR" ? d.etr : selectedIndividualTariff;
            return {
                country: d.country,
                iso2: d.iso2,
                etr: d.etr,
                impact_usd: computeImpactUSD(d.exports, tariff),
                impact_pct: computeImpactPCT(d.exports, tariff, d.gdp)
            };
        });
}

export function binaryFilter(data, selectedCountry, selectedSector) {
    if (selectedCountry !== "ALL") {
        return data.filter(d => d.iso3 === selectedCountry);
    } else if (selectedSector !== "All sectors") {
        return data.filter(d => d.sector === selectedSector);
    } else {
        return data;
    }
}

export function generateSelectionCardData(data, selectedCountry, selectedSector, selectedIndividualTariff) {
    data = binaryFilter(data, selectedCountry, selectedSector);

    return data.map(d => {
        const tariff = selectedIndividualTariff === "ETR" ? d.etr : selectedIndividualTariff;
        return {
            country: d.country,
            iso2: d.iso2,
            sector: d.sector,
            etr: d.etr,
            impact_usd: computeImpactUSD(d.exports, tariff),
            impact_pct: computeImpactPCT(d.exports, tariff, d.gdp)
        };
    });
}
