// Introductory text displayed above the visualisation.
// Text strings are imported from the shared copy module.
import {title, deck} from "../js/copyText.js"

export function Intro({content} = {}) {
    return (
        <div className="intro">
            <h1 className="headline text-hero">
                {title}
            </h1>
            <h2 className="deck text-heading">
                {deck}
            </h2>
            <p className="text-body intro-text">
                The US’s imposition of tariffs would negatively affect African exports and economies. To estimate the impact, we apply the <b>Effective Tariff Rate (ETR)</b>, a measure that reflects the average tariff a country faces weighted by the value of its exports.
            </p>
        </div>
    )};