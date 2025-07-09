import {SectionTitle} from "./SectionTitle.js";
import {DescriptionText} from "./DescriptionText.js";
import {ToggleButton} from "./ToggleButton.js";
import {CountryCarousel} from "./CountryCarousel.js";
import {SelectionCard} from "./SelectionCard.js";
import {sectionTitle} from "../../js/copyText.js";

export function BottomSection({
                                  cardMode,
                                  carouselData,
                                  selectionCardData,
                                  selectedHistoricalData,
                                  isETR,
                                  selectedTariff,
                                  selectedUnits,
                                  setSelectedUnits,
                                  showMore,
                                  setShowMore
                              }) {

    return (
        <div>
            <SectionTitle content={sectionTitle}/>
            <DescriptionText
                data={cardMode === "carousel" ? carouselData : selectionCardData}
                mode={cardMode}
                isETR={isETR}
                selectedTariff={selectedTariff}
                selectedUnits={selectedUnits}
            />
            {
                cardMode === "carousel" ? (
                    <div>
                        <ToggleButton
                            selected={selectedUnits}
                            setSelected={setSelectedUnits}
                        />
                        <CountryCarousel
                            data={carouselData}
                            mode={cardMode}
                            isETR={isETR}
                            selectedTariff={selectedTariff}
                            selectedUnits={selectedUnits}
                        />
                    </div>
                ) : (
                    <SelectionCard
                        data={selectionCardData}
                        historicalData={selectedHistoricalData}
                        mode={cardMode}
                        isETR={isETR}
                        selectedTariff={selectedTariff}
                        showMore={showMore}
                        setShowMore={setShowMore}
                    />
                )
            }
        </div>
    )

}