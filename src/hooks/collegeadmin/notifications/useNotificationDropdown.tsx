import { useState, useCallback, useRef, useEffect } from "react";
import { useViewSentNotifications } from "./useViewSentNotifications";

// ========================
// HOOK
// ========================

export function useNotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        notifications: recentNotifications,
        summary,
        isLoading,
    } = useViewSentNotifications({
        limit: 5,
        enabled: isOpen,
    });

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
    }, []);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    return {
        isOpen,
        toggle,
        close,
        dropdownRef,
        recentNotifications,
        summary,
        isLoading,
    };
}
