import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { type OverrideStatus } from "@/validators/OverrideSchema";
import { useYearFilter } from "@/context/YearFilterContext";

// ========================
// TYPES
// ========================

export interface DashboardOverrideRequest {
    override_id: string;
    student_id: string;
    student_name: string;
    enrollment_number: string;
    dept_name: string;
    student_passout_year: number;
    overall_cgpa: string;
    total_live_kts: number;
    tenth_percentage: string;
    twelfth_or_diploma: string;
    twelfth_percentage: string | null;
    job_id: string;
    job_title: string;
    company_name: string;
    passout_years: number[];
    application_deadline: string | null;
    override_status: OverrideStatus;
    request_reason: string;
    ineligibility_reasons: string;
    review_notes: string | null;
    rejection_reason: string | null;
    reviewed_by_name: string | null;
    requested_at: string;
    reviewed_at: string | null;
}

export interface OverrideSummary {
    pending: number;
    approved: number;
    rejected: number;
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

export const useViewAllOverrides = () => {
    const queryClient = useQueryClient();
    const { selectedYear } = useYearFilter();

    // Filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [jobIdFilter, setJobIdFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortBy, setSortBy] = useState("requested_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = useMemo(() => ({
        page, limit, search: debouncedSearch,
        status: statusFilter, job_id: jobIdFilter, dept_name: deptFilter,
        passout_year: selectedYear, date_from: dateFrom, date_to: dateTo,
        sort_by: sortBy, sort_order: sortOrder,
    }), [page, limit, debouncedSearch, statusFilter, jobIdFilter, deptFilter, selectedYear, dateFrom, dateTo, sortBy, sortOrder]);

    const { data: response, isLoading: loading, error: queryError, isFetching } = useQuery({
        queryKey: queryKeys.overrides.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllOverrideRequests({
            page,
            limit,
            search: debouncedSearch || undefined,
            status: statusFilter || undefined,
            job_id: jobIdFilter || undefined,
            dept_name: deptFilter || undefined,
            passout_year: selectedYear,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            sort_by: sortBy || undefined,
            sort_order: sortOrder || undefined,
        }),
        placeholderData: keepPreviousData,
    });

    // Derive data from query response
    const rawData = response?.data || response;
    const overrides: DashboardOverrideRequest[] = Array.isArray(rawData?.override_requests) ? rawData.override_requests : [];
    const summary: OverrideSummary | null = rawData?.summary || null;
    const pagination: Pagination = response?.pagination || { page, limit, total: 0, totalPages: 0 };

    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch override requests";
    }

    // Prefetch next page
    useEffect(() => {
        if (pagination.page < pagination.totalPages) {
            const nextFilters = { ...queryFilters, page: page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.overrides.all(nextFilters),
                queryFn: () => CollegeAdminService.getAllOverrideRequests({
                    ...nextFilters,
                    search: debouncedSearch || undefined,
                    status: statusFilter || undefined,
                    job_id: jobIdFilter || undefined,
                    dept_name: deptFilter || undefined,
                    passout_year: selectedYear,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                    sort_by: sortBy || undefined,
                    sort_order: sortOrder || undefined,
                }),
            });
        }
    }, [pagination.page, pagination.totalPages, queryFilters, queryClient, page, debouncedSearch, statusFilter, jobIdFilter, deptFilter, selectedYear, dateFrom, dateTo, sortBy, sortOrder]);

    // Cleanup search timer on unmount
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearch(value);
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
            searchTimerRef.current = setTimeout(() => {
                setDebouncedSearch(value);
                setPage(1);
            }, 300);
        },
        [],
    );

    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleJobIdFilterChange = useCallback((value: string) => {
        setJobIdFilter(value);
        setPage(1);
    }, []);

    const handleDeptFilterChange = useCallback((value: string) => {
        setDeptFilter(value);
        setPage(1);
    }, []);

    const handleDateFromChange = useCallback((value: string) => {
        setDateFrom(value);
        setPage(1);
    }, []);

    const handleDateToChange = useCallback((value: string) => {
        setDateTo(value);
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

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    }, []);

    const refresh = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.overrides.all() });
    }, [queryClient]);

    const clearFilters = useCallback(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter("");
        setJobIdFilter("");
        setDeptFilter("");
        setDateFrom("");
        setDateTo("");
        setPage(1);
    }, []);

    return {
        overrides,
        summary,
        loading: loading || isFetching,
        error,
        pagination,
        search,
        statusFilter,
        jobIdFilter,
        deptFilter,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleStatusFilterChange,
        handleJobIdFilterChange,
        handleDeptFilterChange,
        handleDateFromChange,
        handleDateToChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    };
};
