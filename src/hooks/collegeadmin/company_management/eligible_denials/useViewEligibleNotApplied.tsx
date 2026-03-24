import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface EligibleNotAppliedStudent {
    student_id: string;
    student_name: string;
    student_email: string;
    student_passout_year: number;
    dept_name: string;
    overall_cgpa: number;
    total_live_kts: number;
    tenth_percentage: number;
    twelfth_or_diploma: string;
    twelfth_percentage: number | null;
    diploma_percentage: number | null;
    gender: string;
    profile_complete: boolean;
    profile_is_approved: boolean;
}

export interface EligibleNotAppliedJob {
    job_id: string;
    job_title: string;
    company_name: string;
    passout_year: number;
    job_status: string;
    application_deadline: string | null;
}

export interface EligibleNotAppliedCriteria {
    criteria_id: string;
    min_overall_cgpa: number | null;
    max_live_kts: number | null;
    min_tenth_percentage: number | null;
    allowed_departments: string[] | null;
    exclude_already_placed: boolean;
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

export const useViewEligibleNotApplied = (jobId: string) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [sortBy, setSortBy] = useState("overall_cgpa");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = {
        page, limit,
        search: debouncedSearch || undefined,
        dept_name: deptFilter || undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.jobs.eligibleNotApplied(jobId, queryFilters),
        queryFn: () => CollegeAdminService.getEligibleNotApplied(jobId, queryFilters),
        placeholderData: keepPreviousData,
        enabled: !!jobId,
    });

    const responseData = data?.data || data;
    const students: EligibleNotAppliedStudent[] = Array.isArray(responseData?.students) ? responseData.students : [];
    const job: EligibleNotAppliedJob | null = responseData?.job ?? null;
    const criteria: EligibleNotAppliedCriteria | null = responseData?.criteria ?? null;
    const eligibleNotAppliedCount: number = responseData?.eligible_not_applied_count ?? 0;
    const totalApplied: number = responseData?.total_applied ?? 0;
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading || isFetching;
    const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch eligible students") : null;

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
            setPage(1);
        }, 300);
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
        refetch();
    }, [refetch]);

    const clearFilters = useCallback(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearch("");
        setDebouncedSearch("");
        setDeptFilter("");
        setPage(1);
    }, []);

    return {
        students,
        job,
        criteria,
        eligibleNotAppliedCount,
        totalApplied,
        loading,
        error,
        pagination,
        search,
        deptFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handleDeptFilterChange,
        handleSortChange,
        handlePageChange,
        handleLimitChange,
        refresh,
        clearFilters,
    };
};
