import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface JobItem {
    job_id: string;
    company_name: string;
    job_title: string;
    job_type: string;
    job_location: string;
    salary_package: string | null;
    passout_years: number[];
    application_deadline: string;
    job_status: string;
    positions_count: number;
    applications_count: number;
    created_at: string;
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

export const useViewCompanyJobs = (companyId: string) => {
    // ── Local filter / pagination state ──
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── React Query ──
    const queryFilters: Record<string, unknown> = {
        company_id: companyId,
        page,
        limit,
        sort_by: "created_at",
        sort_order: "desc",
    };
    if (debouncedSearch) queryFilters.search = debouncedSearch;
    if (statusFilter) queryFilters.job_status = statusFilter;
    if (typeFilter) queryFilters.job_type = typeFilter;

    const { data, isLoading, isFetching, error: queryError } = useQuery({
        queryKey: queryKeys.jobs.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllJobs(queryFilters),
        placeholderData: keepPreviousData,
        enabled: !!companyId,
    });

    const jobs: JobItem[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading;
    const fetching = isFetching;
    const error = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to load jobs")
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

    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleTypeFilterChange = useCallback((value: string) => {
        setTypeFilter(value);
        setPage(1);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    return {
        jobs,
        loading,
        fetching,
        error,
        pagination,
        search,
        statusFilter,
        typeFilter,
        handleSearchChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handlePageChange,
        handleLimitChange,
    };
};
