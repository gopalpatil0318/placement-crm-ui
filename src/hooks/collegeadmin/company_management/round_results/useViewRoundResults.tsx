import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { type ResultStatus } from "@/validators/RoundResultSchema";

// ========================
// TYPES
// ========================

export interface RoundResult {
    result_id: string;
    application_id: string;
    round_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    dept_name: string;
    enrollment_number: string;
    result_status: ResultStatus;
    score: number | null;
    remarks: string | null;
    attended: boolean;
    scheduled_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface RoundInfo {
    round_name: string;
    round_number: number;
    round_status: string;
    job_title: string;
    company_name: string;
}

export interface StatusSummary {
    total: number;
    pending: number;
    passed: number;
    failed: number;
    on_hold: number;
    absent: number;
    avg_score: number | null;
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

export const useViewRoundResults = (roundId: string) => {
    const queryClient = useQueryClient();

    // Filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [attendedFilter, setAttendedFilter] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = useMemo(() => ({
        page, limit, search: debouncedSearch,
        result_status: statusFilter, attended: attendedFilter,
        sort_by: sortBy, sort_order: sortOrder,
    }), [page, limit, debouncedSearch, statusFilter, attendedFilter, sortBy, sortOrder]);

    const { data: response, isLoading, error: queryError, isFetching } = useQuery({
        queryKey: queryKeys.jobs.roundResults(roundId, queryFilters),
        queryFn: () => CollegeAdminService.getRoundResults(roundId, {
            page,
            limit,
            search: debouncedSearch || undefined,
            result_status: statusFilter || undefined,
            attended: attendedFilter || undefined,
            sort_by: sortBy || undefined,
            sort_order: sortOrder || undefined,
        }),
        enabled: !!roundId,
        placeholderData: keepPreviousData,
    });

    // Derive data from query response
    const rawData = response?.data || response;
    const results: RoundResult[] = Array.isArray(rawData?.results) ? rawData.results : [];
    const roundInfo: RoundInfo | null = rawData ? {
        round_name: rawData.round_name || "",
        round_number: rawData.round_number ?? 0,
        round_status: rawData.round_status || "",
        job_title: rawData.job_title || "",
        company_name: rawData.company_name || "",
    } : null;
    const statusSummary: StatusSummary | null = rawData?.status_summary || null;
    const pagination: Pagination = response?.pagination || { page, limit, total: 0, totalPages: 0 };
    const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch round results") : null;

    // Prefetch next page
    useEffect(() => {
        if (pagination.page < pagination.totalPages) {
            const nextFilters = { ...queryFilters, page: pagination.page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.jobs.roundResults(roundId, nextFilters),
                queryFn: () => CollegeAdminService.getRoundResults(roundId, {
                    page: pagination.page + 1,
                    limit,
                    search: debouncedSearch || undefined,
                    result_status: statusFilter || undefined,
                    attended: attendedFilter || undefined,
                    sort_by: sortBy || undefined,
                    sort_order: sortOrder || undefined,
                }),
            });
        }
    }, [pagination.page, pagination.totalPages, queryFilters, roundId, queryClient, limit, debouncedSearch, statusFilter, attendedFilter, sortBy, sortOrder]);

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

    const handleAttendedFilterChange = useCallback((value: string) => {
        setAttendedFilter(value);
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
        queryClient.invalidateQueries({ queryKey: queryKeys.jobs.roundResults(roundId) });
    }, [queryClient, roundId]);

    const clearFilters = useCallback(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter("");
        setAttendedFilter("");
        setPage(1);
    }, []);

    return {
        results,
        roundInfo,
        statusSummary,
        loading: isLoading || isFetching,
        error,
        pagination,
        search,
        statusFilter,
        attendedFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleStatusFilterChange,
        handleAttendedFilterChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    };
};
