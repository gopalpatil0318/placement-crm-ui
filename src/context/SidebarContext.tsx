"use client";

import React, { createContext, useContext, useState } from "react";

interface SidebarContextType {
    isSidebarOpen: boolean;
    setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isProfileSidebarExpanded: boolean;
    setIsProfileSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileSidebarExpanded, setIsProfileSidebarExpanded] = useState(true);

    return (
        <SidebarContext.Provider
            value={{
                isSidebarOpen,
                setIsSidebarOpen,
                isProfileSidebarExpanded,
                setIsProfileSidebarExpanded,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebarContext() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebarContext must be used within a SidebarProvider");
    }
    return context;
}
