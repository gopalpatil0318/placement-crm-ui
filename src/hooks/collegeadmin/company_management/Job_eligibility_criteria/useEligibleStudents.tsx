import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface EligibleStudent {
    student_id: string;
    student_name: string;
    student_email: string;
    dept_name: string;
    overall_cgpa: number;
    total_live_kts: number;
    tenth_percentage: number;
    twelfth_or_diploma: string;
    twelfth_percentage: number | null;
    diploma_percentage?: number | null;
    gender: string;
    profile_complete: boolean;
}

export interface EligibilityJob {
    job_id: string;
    job_title: string;
    company_name: string;
    passout_year: number;
}

export interface EligibilityCriteria {
    min_overall_cgpa: number | null;
    max_live_kts: number | null;
    min_tenth_percentage: number | null;
    min_twelfth_percentage: number | null;
    min_diploma_percentage: number | null;
    allowed_genders: string[] | null;
    allowed_departments: string[] | null;
    allowed_gap_statuses: string[] | null;
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

export const useEligibleStudents = (jobId: string | undefined) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = {
        page,
        limit,
        search: debouncedSearch || undefined,
        dept_name: deptFilter || undefined,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.students.eligible(jobId!, queryFilters),
        queryFn: () => CollegeAdminService.getEligibleStudents(jobId!, queryFilters),
        placeholderData: keepPreviousData,
        enabled: !!jobId,
    });

    const responseData = data?.data || data;
    const students: EligibleStudent[] = Array.isArray(responseData?.students) ? responseData.students : [];
    const job: EligibilityJob | null = responseData?.job ?? null;
    const criteria: EligibilityCriteria | null = responseData?.criteria ?? null;
    const eligibleCount: number = responseData?.eligible_count ?? 0;
    const totalStudents: number = responseData?.total_students ?? 0;
    const eligibilityPercentage: number = responseData?.eligibility_percentage ?? 0;
    const pagination: Pagination = data?.pagination ?? {
        page,
        limit,
        total: eligibleCount,
        totalPages: Math.ceil(eligibleCount / limit),
    };
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

    return {
        students,
        job,
        criteria,
        eligibleCount,
        totalStudents,
        eligibilityPercentage,
        loading,
        error,
        pagination,
        search,
        deptFilter,
        handleSearchChange,
        handleDeptFilterChange,
        handlePageChange,
        handleLimitChange,
        refresh,
    };
};
