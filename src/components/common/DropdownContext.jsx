// Context used by dropdown menus to close each other when opened.
import * as React from "npm:react";

const DropdownContext = React.createContext();

export function DropdownProvider({ children }) {
    const [openDropdownId, setOpenDropdownId] = React.useState(null);
    return (
        <DropdownContext.Provider value={{ openDropdownId, setOpenDropdownId }}>
            {children}
        </DropdownContext.Provider>
    );
}

export function useDropdownContext() {
    return React.useContext(DropdownContext);
}
