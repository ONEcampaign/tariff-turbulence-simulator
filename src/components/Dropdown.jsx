import * as React from "npm:react";
import { useDropdownContext } from "./DropdownContext.js";

export function Dropdown({ dropdownId, options, selectedOption, setOption, setETR, getETRForOption } = {}) {
    const [localOpen, setLocalOpen] = React.useState(false);
    const { openDropdownId, setOpenDropdownId } = useDropdownContext();

    const isOpen = openDropdownId === dropdownId;

    // Normalize input
    const isMap = typeof options === "object" && !Array.isArray(options);
    const optionKeys = isMap ? Object.keys(options) : options;
    const labelMap = isMap
        ? options
        : Object.fromEntries(optionKeys.map(d => [d, d]));

    const toggleOpen = () => {
        if (isOpen) {
            setOpenDropdownId(null);
        } else {
            setOpenDropdownId(dropdownId);
        }
    };

    return (
        <div className="dropdown">
            <div className="dropdown-menu">
                <div
                    className="dropdown-selected"
                    onClick={toggleOpen}
                >
                    <span>{labelMap[selectedOption]}</span>
                    <ChevronDown className={`dropdown-chevron ${isOpen ? 'rotate' : ''}`} />
                </div>
                {isOpen && (
                    <div className="dropdown-list">
                        <DropdownList
                            options={optionKeys}
                            setOption={setOption}
                            setVisible={() => setOpenDropdownId(null)}
                            labelMap={labelMap}
                            setETR={setETR}
                            getETRForOption={getETRForOption}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function DropdownList({ options, setOption, setVisible, labelMap = {}, setETR, getETRForOption }) {
    return options.map(option => (
        <span
            key={option}
            className="dropdown-list-item"
            onClick={() => {
                setOption(option);
                setVisible(false);
                if (setETR && getETRForOption) {
                    const etr = getETRForOption(option);
                    if (Number.isFinite(etr)) {
                        setETR(etr);
                    }
                }
            }}
        >
      {labelMap[option]}
    </span>
    ));
}

const ChevronDown = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        strokeWidth="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
    >
        <path d="M2 5l6 6 6-6" />
    </svg>
);
