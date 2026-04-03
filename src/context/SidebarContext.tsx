"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

interface SidebarContextType {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isProfileSidebarExpanded: boolean;
    setIsProfileSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileSidebarExpanded, setIsProfileSidebarExpanded] = useState(true);

    const value = useMemo<SidebarContextType>(() => ({
        isSidebarOpen,
        setIsSidebarOpen,
        isProfileSidebarExpanded,
        setIsProfileSidebarExpanded,
    }), [isSidebarOpen, isProfileSidebarExpanded]);

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-exported with provider
export function useSidebarContext() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebarContext must be used within a SidebarProvider");
    }
    return context;
}
