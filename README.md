# Tariff Turbulence Simulator

What’s the impact of US tariffs on African economies? The [Tariff Turbulence Simulator](https://data.one.org/analysis/tariff-turbulence-simulator) estimates the impact of US 
tariffs on African countries and sectors by calculating an Effective Tariff Rate (ETR). The ETR for each country is 
computed as a weighted average of the tariff rates applied to US imports from that country across the products that 
make up a sector.

This is an [Observable Framework](https://observablehq.com/framework/) app.

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

### Back-end

All the files to import and format the data are included in the `src/data/` directory, and are organized as follows:

- `inputs/` contains the input data files. In particular:
  * `tariffs/` includes json files with product and country specific tariffs imposed by the US on imports coming from African countries. 
  * `africa_exports_to_us_2002_2023_baci_raw.csv` contains historical exports data from Africa to the US sourced from [BACI trade database](https://www.cepii.fr/CEPII/en/bdd_modele/bdd_modele_item.asp?id=37). This data is used for the line plots included in the selection cards of the bottom section.
  * `africa_exports_to_us_202X_ustrade_raw.csv` contains exports data from Africa to US sourced from [USA Trade online](https://usatrade.census.gov/index.php). This data is used to compute country- and sector-specific ETRs.
- `loaders/` contains scripts that manage the loading of data into the app:
  * `baci.py` cleans and transforms BACI trade data.
  * `ustrade.py` cleans and transforms US Trade online data, in addition to computing country- and sector-specific ETRs.
- `africa_exports_to_us_2002_2023_baci.csv.py` and `africa_exports_to_us_2022_2024_ustrade.csv.py` invoke their respective loader classes to load data in the app.
- `config.py` contains paths for python scripts to locate the data.
- `etr.py` includes utilities to compute country- and sector-specific ETRs, used by `ustrade.py`. 
- `helpers.py` defines helper functions used across the data pipeline.


### Front-end 

The app contains of the following React components, all inside the `src/components/` directory:

- `Intro.jsx`: Includes app title, subtitle and a short description.
- `MainViz.jsx`: Features an interactive hexmap of Africa (`AfricaHexmap.jsx`), its header (`VizHeader.jsx`) with title, subtitle and legend, as well as a tooltip (`Tooltip.jsx`).
- `ControlPannel.jsx`: A sticky menu which includes country and sector dropdown menus (`Dropdown.jsx`) and a slider to control the tariff rate (`Slider.jsx`).
- `ExposureCard.jsx`: Shows summary values based on selection and is located just below the hexmap.
- `BottomSection.jsx`: Placed under the exposure card, it includes a heading (`SectionTitlte.jsx`), a short description (`DescriptionText.jsx`) and cards that change based on selection. By default, the displayed cards are defined by `CountryCarousel.jsx`. If a country or a sector are selected, the displayed card is given by `SelectionCard.jsx`.
- `Methodology.jsx`: A collapsible section that describes how the data is obtained and transformed to estimate the cost of US tariffs on African economies.
