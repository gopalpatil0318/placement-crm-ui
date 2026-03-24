import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface TrainingProgram {
    program_id: string;
    program_name: string;
    program_type: string;
    trainer_name: string | null;
    trainer_organization: string | null;
    start_date: string | null;
    end_date: string | null;
    total_sessions: number | null;
    program_status: string;
    target_passout_year: number | null;
    max_enrollment: number | null;
    enrollment_deadline: string | null;
    created_by_name: string | null;
    enrolled_count: number;
    completed_count: number;
    dropped_count: number;
    avg_rating: number | null;
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

export const useViewTrainingPrograms = (config?: { limit?: number }) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(config?.limit ?? 12);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [passoutYearFilter, setPassoutYearFilter] = useState("");
    const [sortBy, setSortBy] = useState<string>("created_at");
    const [sortOrder, setSortOrder] = useState<string>("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = {
        page,
        limit,
        search: debouncedSearch || undefined,
        program_status: statusFilter || undefined,
        program_type: typeFilter || undefined,
        target_passout_year: passoutYearFilter ? Number(passoutYearFilter) : undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.trainingPrograms.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllTrainingPrograms(queryFilters),
        placeholderData: keepPreviousData,
    });

    const programs: TrainingProgram[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading || isFetching;
    const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch training programs") : null;

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

    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        setPage(1);
    }, []);

    const handleTypeFilterChange = useCallback((value: string) => {
        setTypeFilter(value);
        setPage(1);
    }, []);

    const handlePassoutYearFilterChange = useCallback((value: string) => {
        setPassoutYearFilter(value);
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
        programs,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        typeFilter,
        passoutYearFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleTypeFilterChange,
        handlePassoutYearFilterChange,
        handleSortChange,
        handleSortFieldChange,
        handleSortOrderToggle,
        refresh: refetch,
    };
};
