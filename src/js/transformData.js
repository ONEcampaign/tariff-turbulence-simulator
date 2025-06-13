export function generateCrossData(data, geoData) {
    // 1. Get unique products from data
    const products = Array.from(new Set(data.map(d => d.product)));

    // 2. Get all keys present in the original data
    const dataKeys = new Set(data.flatMap(d => Object.keys(d)));

    // 3. Extract iso3-country pairs from geoData
    const countries = geoData.features.map(f => ({
        iso3: f.properties.iso3,
        country: f.properties.name
    }));

    // 4. Build a lookup table for existing iso3+product rows
    const dataMap = new Map(
        data.map(d => [`${d.iso3}|${d.product}`, d])
    );

    // 5. Create crossData array
    const crossData = [];

    for (const { iso3, country } of countries) {
        for (const product of products) {
            const key = `${iso3}|${product}`;
            const existing = dataMap.get(key);

            if (existing) {
                crossData.push(existing);
            } else {
                const row = {};
                for (const k of dataKeys) row[k] = null;
                row.iso3 = iso3;
                row.country = country;
                row.product = product;
                crossData.push(row);
            }
        }
    }

    // 6. Add back any "ALL" rows from data that were not included above
    for (const d of data) {
        if (d.iso3 === "ALL") {
            crossData.push(d);
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
