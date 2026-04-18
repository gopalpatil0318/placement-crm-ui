import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface DenialItem {
    denial_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    dept_name: string;
    student_passout_year: number;
    denial_reason: string;
    additional_comments: string | null;
    denied_at: string;
}

export interface DenialJob {
    job_id: string;
    job_title: string;
    company_name: string;
    passout_year: number;
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

export const useViewDenials = (jobId: string) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState("denied_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = {
        page,
        limit,
        search: debouncedSearch || undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.jobs.denials(jobId, queryFilters),
        queryFn: () => CollegeAdminService.getJobDenials(jobId, queryFilters),
        placeholderData: keepPreviousData,
        enabled: !!jobId,
    });

    const responseData = data?.data || data;
    const denials: DenialItem[] = Array.isArray(responseData?.denials) ? responseData.denials : [];
    const job: DenialJob | null = responseData?.job ?? null;
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading || isFetching;
    const errorMessage = queryError instanceof Error ? queryError.message : "Failed to fetch denials";
    const error = queryError ? errorMessage : null;

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
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
        refetch();
    }, [refetch]);

    const clearFilters = useCallback(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearch("");
        setDebouncedSearch("");
        setPage(1);
    }, []);

    return {
        denials,
        job,
        loading,
        error,
        pagination,
        search,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    };
};
