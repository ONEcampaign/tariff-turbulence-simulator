# Tariff Turbulence Simulator

What’s the impact of US tariffs on African economies? The [Tariff Turbulence Simulator](https://data.one.org/analysis/tariff-turbulence-simulator) estimates the impact of US 
tariffs on African countries and sectors by calculating an Effective Tariff Rate (ETR). The ETR for each country is 
computed as a weighted average of the tariff rates applied to US imports from that country across the products that 
make up a sector.

This is an [Observable Framework](https://observablehq.com/framework/) app.

## App structure

The app contains of the following React components:

- `Intro.jsx`: Includes app title, subtitle and a short description
- `MainViz.jsx`: Features an interactive hexmap of Africa (`AfricaHexmap.jsx`), its header (`VizHeader.jsx`) with title, subtitle and legend, as well as a tooltip (`Tooltip.jsx`)
- `ControlPannel.jsx`: A sticky menu which includes country and sector dropdown menus (`Dropdown.jsx`) and a slider to control the tariff rate (`Slider.jsx`)
- `ExposureCard.jsx`: Shows summary values based on selection and is located just below the hexmap.
- `BottomSection.jsx`: Placed under the exposure card, it includes a heading (`SectionTitlte.jsx`), a short description (`DescriptionText.jsx`) and cards that change based on selection. By default, the displayed cards are defined by `CountryCarousel.jsx`. If a country or a sector are selected, the displayed card is given by `SelectionCard.jsx`.
- `Methodology.jsx`: A collapsible section that describes how the data is obtained and transformed to estimate the cost of US tariffs on African economies.

## Project structure

```text
.
├─ src
│  ├─ components/              # React components 
│  ├─ data/                    # Input data files and loaders
│  ├─ js/                      # JavaScript modules
│  ├─ styles/                  # CSS stylesheets
│  ├─ index.md                 # App interface
│  └─ styles.css               # Main CSS module
├─ .gitignore
├─ observablehq.config.js      # the app config file
├─ package.json
└─ README.md
```
