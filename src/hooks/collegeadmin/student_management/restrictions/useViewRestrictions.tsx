import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
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

export const useViewRestrictions = (config?: { limit?: number }) => {
    const currentYear = new Date().getFullYear();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(config?.limit ?? 20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [passoutYear, setPassoutYear] = useState<number>(currentYear);
    const [statusFilter, setStatusFilter] = useState<RestrictionStatusFilter>("all");
    const [typeFilter, setTypeFilter] = useState<RestrictionType | "">("");
    const [sortBy, setSortBy] = useState<RestrictionSortField>("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = {
        passout_year: passoutYear,
        page,
        limit,
        search: debouncedSearch || undefined,
        restriction_type: typeFilter || undefined,
        is_active:
            statusFilter === "active" ? "true" : statusFilter === "resolved" ? "false" : undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    };

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
    const error = queryError
        ? queryError instanceof Error
            ? queryError.message
            : "Failed to fetch restrictions"
        : null;

    useEffect(() => {
        if (error) showToast({ type: "error", title: "Fetch Error", description: error });
    }, [error]);

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

    const handlePassoutYearChange = useCallback((year: number) => {
        setPassoutYear(year);
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
        passoutYear,
        statusFilter,
        typeFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handlePassoutYearChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handleSortFieldChange,
        handleSortOrderToggle,
        refresh: refetch,
    };
};
