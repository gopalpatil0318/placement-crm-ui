import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { useYearFilter } from "@/context/YearFilterContext";

// ========================
// TYPES
// ========================

export interface JobListItem {
    job_id: string;
    company_name: string;
    company_logo: string | null;
    job_title: string;
    job_type: string;
    job_location: string;
    salary_package: string | null;
    passout_years: number[];
    application_deadline: string;
    job_status: string;
    drive_type: string;
    positions_count: number;
    applications_count: number;
    created_by_name: string | null;
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

export const useViewJobs = () => {
    const { selectedYear } = useYearFilter();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);

    // Filters
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("");
    const [driveTypeFilter, setDriveTypeFilter] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        job_status: statusFilter || undefined,
        job_type: jobTypeFilter || undefined,
        drive_type: driveTypeFilter || undefined,
        passout_year: selectedYear,
        company_id: companyFilter || undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    }), [page, limit, debouncedSearch, statusFilter, jobTypeFilter, driveTypeFilter, selectedYear, companyFilter, sortBy, sortOrder]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.jobs.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllJobs(queryFilters),
        placeholderData: keepPreviousData,
    });

    const jobs: JobListItem[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading || isFetching;

    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch jobs";
    }

    // Prefetch next page
    useEffect(() => {
        if (pagination.page < pagination.totalPages) {
            const nextFilters = { ...queryFilters, page: pagination.page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.jobs.all(nextFilters),
                queryFn: () => CollegeAdminService.getAllJobs(nextFilters),
            });
        }
    }, [pagination.page, pagination.totalPages, queryFilters, queryClient]);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearch(value);
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
            searchTimerRef.current = setTimeout(() => {
                setPage(1);
                setDebouncedSearch(value);
            }, 300);
        },
        []
    );

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setPage(1);
        setLimit(newLimit);
    }, []);

    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleJobTypeFilterChange = useCallback((value: string) => {
        setJobTypeFilter(value);
        setPage(1);
    }, []);

    const handleDriveTypeFilterChange = useCallback((value: string) => {
        setDriveTypeFilter(value);
        setPage(1);
    }, []);

    const handleCompanyFilterChange = useCallback((value: string) => {
        setCompanyFilter(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                return prev;
            }
            setSortOrder("asc");
            return field;
        });
        setPage(1);
    }, []);

    return {
        jobs,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        jobTypeFilter,
        driveTypeFilter,
        companyFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleJobTypeFilterChange,
        handleDriveTypeFilterChange,
        handleCompanyFilterChange,
        handleSortChange,
        refresh: refetch,
    };
};
