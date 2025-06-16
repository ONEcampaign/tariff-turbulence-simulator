import { formatCurrency, formatPercentage } from "./format.js";

export function generateCrossData(data, geoData) {
    // 1. Unique products from the dataset
    const products = Array.from(new Set(data.map(d => d.product)));

    // 2. Collect all keys (columns) present in the original data
    const dataKeys = new Set(data.flatMap(d => Object.keys(d)));
    dataKeys.add("iso2"); // Ensure iso2 is always included

    // 3. Build iso2 → iso3 mapping from geoData
    const iso2to3 = Object.fromEntries(
        geoData.features
            .map(f => [f.properties.iso2, f.properties.iso3])
            .filter(([iso2, iso3]) => iso2 && iso3)
    );

    // 4. Build country list from geoData with both iso2 and iso3
    const countries = geoData.features.map(f => ({
        iso3: f.properties.iso3,
        iso2: f.properties.iso2,
        country: f.properties.country
    }));

    // 5. Create lookup using iso3 keys
    const dataMap = new Map(data.map(d => [`${d.iso3}|${d.product}`, d]));

    // 6. Build crossData entries
    const crossData = [];

    for (const { iso3, iso2, country } of countries) {
        for (const product of products) {
            const keyIso3 = `${iso3}|${product}`;
            const keyIso2 = `${iso2}|${product}`;
            const existing = dataMap.get(keyIso3) || dataMap.get(keyIso2);

            if (existing) {
                // Clone and enrich with iso2 (in case it's not present)
                crossData.push({
                    ...existing,
                    iso2,
                    iso3,
                    country,
                    product
                });
            } else {
                const row = {};
                for (const k of dataKeys) row[k] = null;
                row.iso3 = iso3;
                row.iso2 = iso2;
                row.country = country;
                row.product = product;
                crossData.push(row);
            }
        }
    }

    // 7. Add any "ALL" rows
    for (const d of data) {
        if (d.iso3 === "ALL") {
            crossData.push({
                ...d,
                iso2: null // "ALL" likely doesn't have an iso2
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

            // Find matching row by iso3 and product (if any filter applied)
            const row = data.find(d =>
                d.iso3 === iso3 && d.product === clickedSector
            );

            return {
                ...feat,
                properties: {
                    ...feat.properties,
                    etr: row?.etr ?? null
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

export function generateProductGroups(crossData) {
    return Array.from(
        new Set(crossData.map(d => d.product))
    ).sort((a, b) => {
        if (a === "All products") return -1;
        if (b === "All products") return 1;
        return a.localeCompare(b);
    });
}

export function generateCountryData(selectedData, selectedTariff) {
    return {
        country: selectedData.country === "All countries"
            ? "all countries"
            : selectedData.country,
        product: selectedData.product.toLowerCase(),
        tariff: `${selectedTariff}%`,
        exports: selectedData.exports != null
            ? formatCurrency(selectedData.exports)
            : null,
        impact_usd: selectedData.exports != null
            ? formatCurrency(selectedData.exports * selectedTariff * 0.01)
            : null
    };
}

export function generateTooltipData(hoveredData, selectedTariff) {
    return {
        country: hoveredData?.country === "All countries"
            ? "all countries"
            : hoveredData?.country,
        iso2: hoveredData?.iso2 != null
            ? hoveredData.iso2
            : null,
        product: hoveredData?.product.toLowerCase(),
        etr: hoveredData?.etr,
        tariff: `${selectedTariff}%`,
        exports: hoveredData?.exports != null
            ? formatCurrency(hoveredData.exports)
            : null,
        impact_usd: hoveredData?.exports != null
            ? formatCurrency(hoveredData.exports * selectedTariff * 0.01)
            : null,
        impact_pct: hoveredData?.exports != null && hoveredData.gdp != null
            ? formatPercentage(hoveredData.exports * selectedTariff * 0.01 / hoveredData.gdp)
            : null
    };
}
