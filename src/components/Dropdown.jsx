import * as React from "npm:react";
import { useDropdownContext } from "./DropdownContext.js";
import { ChevronDown } from "./ChevronDown.js";

export function Dropdown(
    {
        dropdownId,
        options,
        selectedOption,
        setOption,
        setETR,
        getETRForOption,
        isInactive = false
    } = {}) {
    const [searchText, setSearchText] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const inputRef = React.useRef(null);
    const itemRefs = React.useRef([]);
    const { openDropdownId, setOpenDropdownId } = useDropdownContext();

    const isOpen = openDropdownId === dropdownId;

    const isMap = typeof options === "object" && !Array.isArray(options);
    const optionKeys = isMap ? Object.keys(options) : options;
    const labelMap = isMap ? options : Object.fromEntries(optionKeys.map(d => [d, d]));

    function normalize(str) {
        return str
            .normalize("NFD")                // Decompose accents
            .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
            .toLowerCase();                  // Case-insensitive
    }

    const normalizedSearch = normalize(searchText);

    const filteredOptions = optionKeys.filter(key =>
        normalize(labelMap[key]).includes(normalizedSearch)
    );

    const toggleOpen = () => {
        if (isOpen) {
            closeDropdown();
        } else {
            setOpenDropdownId(dropdownId);
        }
    };

    const closeDropdown = () => {
        setOpenDropdownId(null);
        setSearchText("");
        setHighlightedIndex(0);
    };

    const selectOption = option => {
        setOption(option);
        closeDropdown();

        if (setETR && getETRForOption) {
            const etr = getETRForOption(option);
            if (Number.isFinite(etr)) {
                setETR(etr);
            }
        }
    };

    const handleInputKeyDown = e => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex(0);
            requestAnimationFrame(() => {
                itemRefs.current[0]?.focus();
            });
        } else if (e.key === "Escape") {
            closeDropdown();
        }
    };

    const handleItemKeyDown = (e, index) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = Math.min(index + 1, filteredOptions.length - 1);
            setHighlightedIndex(next);
            itemRefs.current[next]?.focus();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = Math.max(index - 1, 0);
            setHighlightedIndex(prev);
            itemRefs.current[prev]?.focus();
        } else if (e.key === "Enter") {
            e.preventDefault();
            selectOption(filteredOptions[index]);
        } else if (e.key === "Escape") {
            closeDropdown();
        }
    };

    return (
        <div className="dropdown">
            <div className="dropdown-menu">
                <div
                    className={`dropdown-selected ${isInactive ? "inactive" : ""}`}
                    onClick={toggleOpen}
                >
                    <span className={`text-inputs ${!labelMap[selectedOption] ? "placeholder" : ""}`}>
                        {labelMap[selectedOption] === "All countries"
                            ? "Choose a country"
                            : labelMap[selectedOption] === "All sectors"
                                ? "Choose a sector"
                                : labelMap[selectedOption]}
                    </span>
                    <ChevronDown className={`dropdown-chevron ${isOpen ? "rotate" : ""}`} />
                </div>
                {isOpen && (
                    <div className="dropdown-list-container">
                        <input
                            ref={inputRef}
                            className="dropdown-search"
                            type="text"
                            value={searchText}
                            onChange={e => {
                                setSearchText(e.target.value);
                                setHighlightedIndex(0);
                            }}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Search..."
                            autoFocus
                        />
                        <div className="dropdown-list">
                            {filteredOptions.map((option, i) => (
                                <span
                                    key={option}
                                    ref={el => (itemRefs.current[i] = el)}
                                    className={`text-inputs dropdown-list-item ${i === highlightedIndex ? "highlighted" : ""}`}
                                    tabIndex="-1"
                                    onMouseEnter={() => setHighlightedIndex(i)}
                                    onClick={() => selectOption(option)}
                                    onKeyDown={e => handleItemKeyDown(e, i)}
                                >
                                    {labelMap[option]}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
