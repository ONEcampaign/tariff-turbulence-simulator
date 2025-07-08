import * as React from "npm:react";
import { ChevronDown } from "./ChevronDown.js";

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
                    <p className="text-body">
                        The <em>Tariff Turbulence Simulator</em> estimates the impact of US tariffs on African countries and sectors using country- and sector-specific Effective Tariff Rates (ETR) as well as trade data.
                    </p>

                    <p className="text-body">
                        The ETR for each country is computed as a weighted average of the tariff rates applied to US imports from that country across the products in a sector, using trade values from 2022 to 2024
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
                        <p className="text-body">So, Country A faces an effective tariff rate of 37% on its exports to the US.</p>
                    </div>

                    <p className="text-body">To calculate the ETR, we rely on the following data:</p>

                    <ul className="text-body">
                        <li>US import values from African countries (<a href="https://usatrade.census.gov/index.php" target="_blank">USA Trade Online</a>)</li>
                        <li><a href="https://www.federalregister.gov/documents/2025/03/05/2025-03596/implementation-of-duties-on-aluminum-pursuant-to-proclamation-10895-adjusting-imports-of-aluminum" target="_blank">Tariffs on aluminum</a></li>
                        <li><a href="https://www.federalregister.gov/documents/2025/03/05/2025-03598/implementation-of-duties-on-steel-pursuant-to-proclamation-10896-adjusting-imports-of-steel-into-the" target="_blank">Tariffs on steel</a></li>
                        <li><a href="https://www.federalregister.gov/documents/2025/04/03/2025-05930/adjusting-imports-of-automobiles-and-automobile-parts-into-the-united-states" target="_blank">Tariffs on automobiles and auto parts</a></li>
                        <li>Tariff exemptions (<a href="https://www.whitehouse.gov/wp-content/uploads/2025/04/Annex-II.pdf" target="_blank">April 2, 2025</a>)</li>
                        <li>Tariff exemptions (<a href="https://www.whitehouse.gov/presidential-actions/2025/04/clarification-of-exceptions-under-executive-order-14257-of-april-2-2025-as-amended/" target="_blank">April 11, 2025</a>)</li>
                    </ul>

                    <p className="text-body">
                        Country- and sector-level ETRs are calculated based on the average export values between 2022 and 2024.
                        The total cost results from multiplying country-sector ETRs by the corresponding average export value.
                        This assumes that the full cost of US tariffs is passed onto exporting countries.
                    </p>

                    <p className="text-body">
                        To calculate the cost per capita, the result in US dollars is divided by the average population from 2022 to 2024.
                        Population data is sourced from the IMF's <em>World Economic Outlook</em> via <a href="https://docs.one.org/tools/bblocks/data-importers/importers/weo/" target="_blank"> our <code>bblocks.data-importers</code> package</a>.
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
                        Historical exports from African countries to the US between 2002 and 2023 are sourced from the <a href="https://www.cepii.fr/CEPII/en/bdd_modele/bdd_modele_item.asp?id=37" target="_blank">BACI</a> trade database.
                    </p>
                </div>
            </div>
        </div>
    );
}
