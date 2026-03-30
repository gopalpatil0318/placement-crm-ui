import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface Department {
    dept_id: string;
    dept_name: string;
    dept_code: string | null;
    dept_type: string | null;
    program_duration_years: number;
    total_semesters: number;
    is_active: boolean;
    created_at: string;
    user_count: number;
    student_count: number;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ========================
// HOOK
// ========================

export const useViewDepartments = () => {
    const queryClient = useQueryClient();

    // ── Local filter / pagination state ──
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── React Query ──
    const queryFilters = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        is_active:
            statusFilter === "true"
                ? true
                : statusFilter === "false"
                    ? false
                    : undefined,
    }), [page, limit, debouncedSearch, statusFilter]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.departments.all(queryFilters),
        queryFn: () => CollegeAdminService.getDepartments(queryFilters),
        placeholderData: keepPreviousData,
    });

    const departments: Department[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const error = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to fetch departments")
        : null;

    // ── Prefetch next page for smoother pagination ──
    useEffect(() => {
        if (pagination.totalPages > page) {
            const nextFilters = { ...queryFilters, page: page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.departments.all(nextFilters),
                queryFn: () => CollegeAdminService.getDepartments(nextFilters),
            });
        }
    }, [page, pagination.totalPages, queryClient, queryFilters]);

    // ── Handlers (same API surface as before) ──

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

    const handleStatusFilterChange = useCallback((value: "" | "true" | "false") => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    return {
        departments,
        loading: isLoading,
        isFetching,
        error,
        pagination,
        search,
        statusFilter,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        refresh: refetch,
    };
};
