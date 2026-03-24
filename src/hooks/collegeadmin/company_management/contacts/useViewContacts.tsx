import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface Contact {
    contact_id: string;
    contact_name: string;
    contact_designation: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_primary: boolean;
    is_active: boolean;
    notes: string | null;
}

// ========================
// HOOK
// ========================

export const useViewContacts = (companyId: string | undefined) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isActiveFilter, setIsActiveFilter] = useState<"" | "true" | "false">("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters: Record<string, unknown> = {};
    if (isActiveFilter === "true") queryFilters.is_active = true;
    if (isActiveFilter === "false") queryFilters.is_active = false;
    if (debouncedSearch) queryFilters.search = debouncedSearch;

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.companies.contacts(companyId!, queryFilters),
        queryFn: () => CollegeAdminService.getContacts(companyId!, queryFilters),
        enabled: !!companyId,
        placeholderData: keepPreviousData,
    });

    const responseData = data?.data || data;
    const contacts: Contact[] = Array.isArray(responseData?.contacts) ? responseData.contacts : [];
    const totalContacts: number = responseData?.total_contacts ?? 0;
    const activeContacts: number = responseData?.active_contacts ?? 0;
    const loading = isLoading || isFetching;
    const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch contacts") : null;

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    }, []);

    const handleIsActiveFilterChange = useCallback((value: "" | "true" | "false") => {
        setIsActiveFilter(value);
    }, []);

    const refresh = useCallback(() => {
        refetch();
    }, [refetch]);

    return {
        contacts,
        totalContacts,
        activeContacts,
        loading,
        error,
        search,
        isActiveFilter,
        handleSearchChange,
        handleIsActiveFilterChange,
        refresh,
    };
};
