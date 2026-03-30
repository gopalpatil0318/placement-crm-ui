import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import { useYearFilter } from "@/context/YearFilterContext";
import {
    type CollegeRestrictionListItem,
    type RestrictionType,
    type RestrictionSortField,
    type RestrictionStatusFilter,
} from "@/validators/RestrictionSchema";

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

function resolveIsActive(statusFilter: RestrictionStatusFilter): string | undefined {
    if (statusFilter === "active") return "true";
    if (statusFilter === "resolved") return "false";
    return undefined;
}

export const useViewRestrictions = (config?: { limit?: number }) => {
    const { selectedYear } = useYearFilter();
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(config?.limit ?? 20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<RestrictionStatusFilter>("all");
    const [typeFilter, setTypeFilter] = useState<RestrictionType | "">("");
    const [sortBy, setSortBy] = useState<RestrictionSortField>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = useMemo(() => ({
        passout_year: selectedYear,
        page,
        limit,
        search: debouncedSearch || undefined,
        restriction_type: typeFilter || undefined,
        is_active: resolveIsActive(statusFilter),
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    }), [selectedYear, page, limit, debouncedSearch, typeFilter, statusFilter, sortBy, sortOrder]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.restrictions.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllRestrictions(queryFilters),
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        retry: 2,
        refetchOnWindowFocus: false,
    });

    const restrictions: CollegeRestrictionListItem[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };

    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch restrictions";
    }

    useEffect(() => {
        if (error) showToast({ type: "error", title: "Fetch Error", description: error });
    }, [error]);

    // Prefetch next page
    useEffect(() => {
        if (pagination.page < pagination.totalPages) {
            const nextFilters = { ...queryFilters, page: pagination.page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.restrictions.all(nextFilters),
                queryFn: () => CollegeAdminService.getAllRestrictions(nextFilters),
                staleTime: 30_000,
            });
        }
    }, [pagination.page, pagination.totalPages, queryFilters, queryClient]);

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

    const handleStatusFilterChange = useCallback((value: RestrictionStatusFilter) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleTypeFilterChange = useCallback((value: RestrictionType | "") => {
        setTypeFilter(value);
        setPage(1);
    }, []);

    const handleSortFieldChange = useCallback((field: RestrictionSortField) => {
        setSortBy(field);
        setSortOrder("desc");
        setPage(1);
    }, []);

    const handleSortOrderToggle = useCallback(() => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setPage(1);
    }, []);

    return {
        restrictions,
        loading: isLoading,
        isFetching,
        error,
        pagination,
        search,
        statusFilter,
        typeFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handleSortFieldChange,
        handleSortOrderToggle,
        refresh: refetch,
    };
};
