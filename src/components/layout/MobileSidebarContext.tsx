"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface MobileSidebarContextType {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
    isOpen: false,
    open: () => { },
    close: () => { },
    toggle: () => { },
});

export function useMobileSidebar() {
    return useContext(MobileSidebarContext);
}

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return (
        <MobileSidebarContext.Provider value={{ isOpen, open, close, toggle }}>
            {children}
        </MobileSidebarContext.Provider>
    );
}
