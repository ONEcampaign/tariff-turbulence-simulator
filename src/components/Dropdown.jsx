import * as React from "npm:react";

export function Dropdown({ options, selectedOption, setOption } = {}) {
    const [showOptions, setShowOptions] = React.useState(false);

    // Normalize input: allow options to be either an array or a map
    const isMap = typeof options === "object" && !Array.isArray(options);
    const optionKeys = isMap ? Object.keys(options) : options;
    const labelMap = isMap
        ? options
        : Object.fromEntries(optionKeys.map(d => [d, d])); // identity map

    return (
        <div className="dropdown">
            <div className="dropdown-menu">
                <div
                    className="dropdown-selected"
                    onClick={() => setShowOptions(!showOptions)}
                >
                    <span>{labelMap[selectedOption]}</span>
                    <ChevronDown className={`dropdown-chevron ${showOptions ? 'rotate' : ''}`} />
                </div>
                {showOptions && (
                    <div className="dropdown-list">
                        <DropdownList
                            options={optionKeys}
                            setOption={setOption}
                            setVisible={setShowOptions}
                            labelMap={labelMap}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function DropdownList({ options, setOption, setVisible, labelMap = {} }) {
    return options.map(option => (
        <span
            key={option}
            className="dropdown-list-item"
            onClick={() => {
                setOption(option);
                setVisible(false);
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
