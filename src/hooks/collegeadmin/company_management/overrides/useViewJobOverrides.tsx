import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { type OverrideStatus } from "@/validators/OverrideSchema";

// ========================
// TYPES
// ========================

export interface OverrideRequest {
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
    override_status: OverrideStatus;
    request_reason: string;
    ineligibility_reasons: string;
    review_notes: string | null;
    rejection_reason: string | null;
    reviewed_by_name: string | null;
    requested_at: string;
    reviewed_at: string | null;
}

export interface OverrideJob {
    job_id: string;
    job_title: string;
    company_name: string;
    passout_years: number[];
    application_deadline: string | null;
    job_status: string;
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

export const useViewJobOverrides = (jobId: string) => {
    const queryClient = useQueryClient();

    // Filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [sortBy, setSortBy] = useState("requested_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = useMemo(() => ({
        page, limit, search: debouncedSearch,
        status: statusFilter, dept_name: deptFilter,
        sort_by: sortBy, sort_order: sortOrder,
    }), [page, limit, debouncedSearch, statusFilter, deptFilter, sortBy, sortOrder]);

    const { data: response, isLoading: loading, error: queryError, isFetching } = useQuery({
        queryKey: queryKeys.jobs.overrides(jobId, queryFilters),
        queryFn: () => CollegeAdminService.getJobOverrideRequests(jobId, {
            page,
            limit,
            status: statusFilter || undefined,
            dept_name: deptFilter || undefined,
            sort_by: sortBy || undefined,
            sort_order: sortOrder || undefined,
        }),
        enabled: !!jobId,
        placeholderData: keepPreviousData,
    });

    // Derive data from query response
    const rawData = response?.data || response;
    const overrides: OverrideRequest[] = Array.isArray(rawData?.override_requests) ? rawData.override_requests : [];
    const job: OverrideJob | null = rawData?.job || null;
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
                queryKey: queryKeys.jobs.overrides(jobId, nextFilters),
                queryFn: () => CollegeAdminService.getJobOverrideRequests(jobId, {
                    ...nextFilters,
                    status: statusFilter || undefined,
                    dept_name: deptFilter || undefined,
                    sort_by: sortBy || undefined,
                    sort_order: sortOrder || undefined,
                }),
            });
        }
    }, [pagination.page, pagination.totalPages, queryFilters, queryClient, jobId, page, statusFilter, deptFilter, sortBy, sortOrder]);

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

    const handleDeptFilterChange = useCallback((value: string) => {
        setDeptFilter(value);
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
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.overrides(jobId) });
    }, [queryClient, jobId]);

    const clearFilters = useCallback(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter("");
        setDeptFilter("");
        setPage(1);
    }, []);

    return {
        overrides,
        job,
        summary,
        loading: loading || isFetching,
        error,
        pagination,
        search,
        statusFilter,
        deptFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleStatusFilterChange,
        handleDeptFilterChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    };
};
