// Collapsible section at the bottom of the app describing the tool's methodology
import * as React from "npm:react";
import { ChevronDown } from "./svgs/ChevronDown.js";

export function Methodology() {
    const [isOpen, setIsOpen] = React.useState(false);
    const contentRef = React.useRef(null);
    const [maxHeight, setMaxHeight] = React.useState("0px");

    React.useEffect(() => {
        if (isOpen && contentRef.current) {
            const scrollHeight = contentRef.current.scrollHeight;
            setMaxHeight(`${scrollHeight}px`);
        } else {
            setMaxHeight("0px");
        }
    }, [isOpen]);

    return (
        <div className="methodology-container">
            <div
                className="methodology-header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h2 className="text-heading">
                    Methodology
                </h2>
                <ChevronDown className={`dropdown-chevron ${isOpen ? "rotate" : ""}`} />
            </div>

            <div
                className="methodology-body-wrapper"
                style={{maxHeight}}
            >
                <div ref={contentRef}>

                    <p className="text-body update-note">
                        Last updated: June 15, 2026
                    </p>

                    <p className="text-body">
                        The <em>Tariff Turbulence Simulator</em> is an <a href="https://github.com/ONEcampaign/tariff-turbulence-simulator" target="_blank">open-source</a> project that estimates the impact of US tariffs on African economies using country- and sector-specific Effective Tariff Rates (ETR) as well as trade data.
                    </p>

                    <p className="text-body">
                        The ETR for each country is computed as a weighted average of the tariff rates applied to US imports from that country across the products in a sector, using annual average trade values between 2022 and 2024.
                    </p>

                    <div className="tariff-card">
                        <p className="text-body"><b>Example:</b></p>
                        <p className="text-body">Country A exports the following to the United States:</p>
                        <ul className="text-body">
                            <li>Aluminum: $10 million (subject to a 50% tariff)</li>
                            <li>Auto parts: $5 million (subject to a 25% tariff)</li>
                            <li>Semiconductors: $2 million (exempt from tariffs)</li>
                        </ul>
                        <p className="text-body">The ETR is calculated as follows:</p>
                        <pre>ETR = [(10 × 0.5) + (5 × 0.25) + (2 × 0)] / (10 + 5 + 2) = 0.37</pre>
                        <p className="text-body">Country A faces an effective tariff rate of 37% on its exports to the US.</p>
                    </div>

                    <p className="text-body">
                        The recent evolution of US tariff policy has been marked by frequent reversals, escalations, and
                        reciprocal measures, making the landscape challenging to track. <a href="https://ustr.gov/trade-topics/presidential-tariff-actions" target="_blank">This document</a> provides
                        a useful summary of the tariff landscape. In addition, we rely on the following data sources to compute country- and sector-specific ETRs:</p>

                    <ul className="text-body">
                        <li>US imports from African countries (<a href="https://usatrade.census.gov/index.php" target="_blank">US Census</a>)</li>
                        <li>50% tariff on aluminum (Section 232, <a href="https://www.federalregister.gov/documents/2025/03/05/2025-03596/implementation-of-duties-on-aluminum-pursuant-to-proclamation-10895-adjusting-imports-of-aluminum" target="_blank">Proclamation 10895</a>, effective March 12, 2025)</li>
                        <li>50% tariff on steel (Section 232, <a href="https://www.federalregister.gov/documents/2025/03/05/2025-03598/implementation-of-duties-on-steel-pursuant-to-proclamation-10896-adjusting-imports-of-steel-into-the" target="_blank">Proclamation 10896</a>, effective March 12, 2025)</li>
                        <li>25% tariff on automobiles and auto parts (Section 232, <a href="https://www.federalregister.gov/documents/2025/04/03/2025-05930/adjusting-imports-of-automobiles-and-automobile-parts-into-the-united-states" target="_blank">Proclamation 10908</a>, as amended by <a href="https://www.federalregister.gov/documents/2025/05/05/2025-07833/adjusting-imports-of-automobiles-and-automobile-parts-into-the-united-states" target="_blank">Proclamation 10925</a>; effective April 3, 2025 for automobiles and May 3, 2025 for auto parts)</li>
                        <li>50% tariff on copper (Section 232, <a href="https://www.federalregister.gov/documents/2025/08/05/2025-14893/adjusting-imports-of-copper-into-the-united-states" target="_blank">Proclamation 10962</a>, effective August 1, 2025; rate structure amended by <a href="https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states" target="_blank">Proclamation 11021</a>, April 6, 2026)</li>
                        <li>Tariffs on softwood timber and lumber (10%) and certain wood furniture and kitchen cabinets (25%) (Section 232, <a href="https://www.federalregister.gov/documents/2025/10/06/2025-19482/adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united-states" target="_blank">Proclamation 10976</a>, effective October 14, 2025; <a href="https://www.federalregister.gov/documents/2026/01/09/2026-00327/amendments-to-adjusting-imports-of-timber-lumber-and-their-derivative-products-into-the-united" target="_blank">amended January 2026</a> to defer rate increases to January 1, 2027)</li>
                        <li>25% tariff on medium- and heavy-duty vehicles, parts, and buses (Section 232, <a href="https://www.federalregister.gov/documents/2025/10/22/2025-19639/adjusting-imports-of-medium-and-heavy-duty-vehicles-medium-and-heavy-duty-vehicle-parts-and-buses" target="_blank">Proclamation 10984</a>, effective November 1, 2025)</li>
                        <li>10% uniform import surcharge on all non-exempt countries (Section 122, <a href="https://www.federalregister.gov/documents/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems" target="_blank">Proclamation 11012</a>, effective February 24, 2026) with exemptions (<a href="https://www.whitehouse.gov/wp-content/uploads/2026/02/2026Section122.prc_.ANNEX1_.FINAL_.pdf" target="_blank">Annex I</a> and <a href="https://www.whitehouse.gov/wp-content/uploads/2026/02/2026Section122.prc_.ANNEX2_.Final_.pdf" target="_blank">Annex II</a>)</li>
                        <li>25% tariff on derivative articles substantially made of steel, aluminum, or copper (Section 232, <a href="https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states" target="_blank">Proclamation 11021</a>, Annex I-B, effective April 6, 2026; amended by <a href="https://www.whitehouse.gov/presidential-actions/2026/06/strengthening-and-amending-section-232-actions-with-respect-to-steel-and-aluminum/" target="_blank">Proclamation 11032</a>, effective June 8, 2026, to add steel storage racks and aluminum lithographic plates)</li>
                        <li>15% transitional tariff on certain industrial machinery, agricultural equipment, and HVAC equipment substantially made of steel or aluminum (Section 232, <a href="https://www.federalregister.gov/documents/2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states" target="_blank">Proclamation 11021</a>, Annex III, effective April 6, 2026 through December 31, 2027; rises to 25% after January 1, 2028; agricultural equipment and HVAC added to Annex III by <a href="https://www.whitehouse.gov/presidential-actions/2026/06/strengthening-and-amending-section-232-actions-with-respect-to-steel-and-aluminum/" target="_blank">Proclamation 11032</a>, effective June 8, 2026)</li>
                        <li>100% tariff on patented pharmaceuticals and active pharmaceutical ingredients, with generics exempt (Section 232, <a href="https://www.federalregister.gov/documents/2026/04/09/2026-06956/adjusting-imports-of-pharmaceuticals-and-pharmaceutical-ingredients-into-the-united-states" target="_blank">Proclamation 11020</a>, effective July 31, 2026 for named companies / September 29, 2026 for all others)</li>
                    </ul>

                    <p className="text-body">
                        ETRs are calculated based on the average export values between 2022 and 2024. The total cost
                        results from multiplying country-sector ETRs by the corresponding average export value. This
                        assumes that the full cost of US tariffs is passed onto exporting countries.
                    </p>

                    <p className="text-body">
                        <strong>Limitations:</strong> Country-level rates are applied uniformly to all products from a given country that are not covered by a product-specific tariff. Morocco is assigned the standard 10% Section 122 surcharge, as the Section 122 proclamation does not explicitly exempt US free trade agreement partners other than USMCA. Goods qualifying under the US–Morocco Free Trade Agreement (general note 27 to the HTSUS) may in practice face lower duties, meaning Morocco's effective tariff rate may be slightly overestimated. The November 2025 agricultural exemptions order includes 11 subheadings that are only partially exempt — applying solely to specific product descriptions within those codes (e.g., etrogs, acai, goods for religious purposes). Because trade data contains HTS codes but not product descriptions, these partial exemptions cannot be distinguished from non-exempt trade in the same subheading and are treated as fully taxable. The affected goods are sufficiently niche that the impact on aggregate ETRs is negligible.
                    </p>

                    <p className="text-body">
                        To calculate the cost per person, the result in US dollars is divided by the average population from 2022 to 2024.
                        Population data is sourced from the <a href="https://data.worldbank.org/indicator/SP.POP.TOTL" target="_blank">World Bank</a> (indicator SP.POP.TOTL) via <a href="https://docs.one.org/tools/bblocks/data-importers/" target="_blank">our <code>bblocks.data-importers</code> package</a>.
                    </p>

                    <p className="text-body">
                        Products are grouped into sectors based on the first two digits of their HTSUS/HS classification codes, as follows:
                    </p>

                    <ul className="text-body">
                        <li><strong>Agricultural &amp; Foods:</strong> 01–24</li>
                        <li><strong>Energy &amp; Minerals:</strong> 25–28</li>
                        <li><strong>Chemical &amp; Pharmaceutical:</strong> 29–36, 38–40</li>
                        <li><strong>Consumer Goods &amp; Crafts:</strong> 37, 41–49, 68–71, 91–92, 94–96</li>
                        <li><strong>Textile &amp; Apparel Manufacturing:</strong> 50–67</li>
                        <li><strong>Base Metals:</strong> 72–76, 78–83</li>
                        <li><strong>Industrial Equipment &amp; Technology:</strong> 84–90, 93</li>
                        <li><strong>Art &amp; Collectibles:</strong> 97</li>
                    </ul>

                    <p className="text-body">
                        Historical exports from African countries to the US between 2002 and 2024 are sourced from the <a href="https://www.cepii.fr/CEPII/en/bdd_modele/bdd_modele_item.asp?id=37" target="_blank">BACI</a> trade database.
                    </p>
                </div>
            </div>
        </div>
    );
}
