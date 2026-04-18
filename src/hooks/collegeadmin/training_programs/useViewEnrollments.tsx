import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface Enrollment {
    enrollment_id: string;
    program_id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    dept_name: string;
    passout_year: number;
    enrolled_at: string;
    sessions_attended: number;
    completion_status: string;
    completion_percentage: number;
    certificate_issued: boolean;
    certificate_url: string | null;
    student_feedback: string | null;
    student_rating: number | null;
    completed_at: string | null;
    payment_status: string;
    amount_paid: number;
    created_at: string;
    updated_at: string;
}

export interface EnrollmentSummary {
    total_enrolled: number;
    enrolled_count: number;
    in_progress_count: number;
    completed_count: number;
    dropped_count: number;
    failed_count: number;
    avg_completion: number | null;
    avg_sessions: number | null;
    avg_rating: number | null;
}

export interface EnrollmentProgram {
    program_id: string;
    program_name: string;
    total_sessions: number;
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

export const useViewEnrollments = (programId: string | undefined) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortBy, setSortBy] = useState<string>("enrolled_at");
    const [sortOrder, setSortOrder] = useState<string>("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        completion_status: statusFilter || undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    }), [page, limit, debouncedSearch, statusFilter, sortBy, sortOrder]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.trainingPrograms.enrollments(programId!, queryFilters),
        queryFn: () => CollegeAdminService.getTrainingEnrollments(programId!, queryFilters),
        enabled: !!programId,
        placeholderData: keepPreviousData,
    });

    const enrollments: Enrollment[] = Array.isArray(data?.data?.enrollments) ? data.data.enrollments : [];
    const summary: EnrollmentSummary | null = data?.data?.summary ?? null;
    const program: EnrollmentProgram | null = data?.data?.program ?? null;
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading || isFetching;
    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof Error ? queryError.message : "Failed to fetch enrollments";
    }

    useEffect(() => {
        if (error) showToast({ type: "error", title: "Fetch Error", description: error });
    }, [error]);

    // ── Prefetch next page for smoother pagination ──
    useEffect(() => {
        if (pagination.totalPages > page && programId) {
            const nextFilters = { ...queryFilters, page: page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.trainingPrograms.enrollments(programId, nextFilters),
                queryFn: () => CollegeAdminService.getTrainingEnrollments(programId, nextFilters),
            });
        }
    }, [page, pagination.totalPages, queryClient, queryFilters, programId]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, []);

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

    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
            } else {
                setSortOrder("desc");
            }
            return field;
        });
        setPage(1);
    }, []);

    const handleSortFieldChange = useCallback((field: string) => {
        setSortBy(field);
        setSortOrder("desc");
        setPage(1);
    }, []);

    const handleSortOrderToggle = useCallback(() => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setPage(1);
    }, []);

    return {
        enrollments,
        summary,
        program,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleSortChange,
        handleSortFieldChange,
        handleSortOrderToggle,
        refresh: refetch,
    };
};
