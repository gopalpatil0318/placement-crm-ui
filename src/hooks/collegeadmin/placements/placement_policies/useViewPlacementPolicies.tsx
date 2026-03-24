import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface PolicyListItem {
    policy_id: string;
    passout_year: number;
    policy_title: string;
    policy_description: string;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
    created_by_name: string;
}

export interface PolicySummary {
    total_policies: number;
    active_count: number;
    inactive_count: number;
    year_count: number;
}

// ========================
// HOOK
// ========================

export const useViewPlacementPolicies = () => {
    // ── Local filter / pagination state ──
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [passoutYear, setPassoutYear] = useState("");
    const [isActive, setIsActive] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── React Query ──
    const queryFilters = {
        page,
        limit,
        search: debouncedSearch || undefined,
        passout_year: passoutYear ? Number(passoutYear) : undefined,
        is_active: isActive || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.placements.policies(queryFilters),
        queryFn: () => CollegeAdminService.getAllPlacementPolicies(queryFilters),
        placeholderData: keepPreviousData,
    });

    // ── Derive data from response ──
    const responseData = data?.data || data;
    const policies: PolicyListItem[] = responseData?.policies || [];

    // Summary counts come as strings from API — parse to numbers
    const rawSummary = responseData?.summary;
    const summary: PolicySummary | null = rawSummary
        ? {
              total_policies: Number(rawSummary.total_policies) || 0,
              active_count: Number(rawSummary.active_count) || 0,
              inactive_count: Number(rawSummary.inactive_count) || 0,
              year_count: Number(rawSummary.year_count) || 0,
          }
        : null;

    const pagination = responseData?.pagination || data?.pagination || {
        page,
        limit,
        total: 0,
        totalPages: 0,
    };
    const loading = isLoading || isFetching;
    const error = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to load policies")
        : null;

    // ── Handlers ──

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
            } else {
                setSortOrder("asc");
            }
            return field;
        });
        setPage(1);
    }, []);

    const handlePassoutYearChange = useCallback((year: string) => {
        setPassoutYear(year);
        setPage(1);
    }, []);

    const handleStatusFilterChange = useCallback((status: string) => {
        setIsActive(status);
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setSearch("");
        setDebouncedSearch("");
        setPassoutYear("");
        setIsActive("");
        setSortBy("created_at");
        setSortOrder("desc");
        setPage(1);
    }, []);

    return {
        policies,
        summary,
        loading,
        error,
        pagination,
        search,
        passoutYear,
        isActive,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleSortChange,
        handlePassoutYearChange,
        handleStatusFilterChange,
        clearFilters,
        refresh: refetch,
    };
};
