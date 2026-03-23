import { useState, useCallback, useRef } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface ApplicationListItem {
    application_id: string;
    student_id: string;
    job_id: string;
    position_id: string | null;
    application_status: string;
    current_round_id: string | null;
    is_eligible: boolean;
    eligibility_remarks: string | null;
    applied_at: string;
    last_updated_at: string;
    student_name: string;
    student_email: string;
    prn_no: string | null;
    roll_no: string | null;
    dept_name: string | null;
    position_name: string | null;
}

export interface StatusSummary {
    total: number;
    pending: number;
    under_review: number;
    shortlisted: number;
    rejected: number;
    selected: number;
    offered: number;
    withdrawn: number;
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

export const useViewApplications = (jobId: string) => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [eligibilityFilter, setEligibilityFilter] = useState("");
    const [positionFilter, setPositionFilter] = useState("");
    const [appliedAfter, setAppliedAfter] = useState("");
    const [appliedBefore, setAppliedBefore] = useState("");
    const [sortBy, setSortBy] = useState("applied_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const queryFilters = {
        page,
        limit,
        search: debouncedSearch || undefined,
        application_status: statusFilter || undefined,
        is_eligible: eligibilityFilter || undefined,
        position_id: positionFilter || undefined,
        applied_after: appliedAfter || undefined,
        applied_before: appliedBefore || undefined,
        sort_by: sortBy || undefined,
        sort_order: sortOrder || undefined,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.jobs.applications(jobId, queryFilters),
        queryFn: () => CollegeAdminService.getJobApplications(jobId, queryFilters),
        placeholderData: keepPreviousData,
        enabled: !!jobId,
    });

    const responseData = data?.data || data;
    const applications: ApplicationListItem[] = Array.isArray(responseData?.applications) ? responseData.applications : [];
    const statusSummary: StatusSummary | null = responseData?.status_summary ?? null;
    const jobTitle: string = responseData?.job_title ?? "";
    const companyName: string = responseData?.company_name ?? "";
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };
    const loading = isLoading || isFetching;
    const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to fetch applications") : null;

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

    const handleEligibilityFilterChange = useCallback((value: string) => {
        setEligibilityFilter(value);
        setPage(1);
    }, []);

    const handlePositionFilterChange = useCallback((value: string) => {
        setPositionFilter(value);
        setPage(1);
    }, []);

    const handleAppliedAfterChange = useCallback((value: string) => {
        setAppliedAfter(value);
        setPage(1);
    }, []);

    const handleAppliedBeforeChange = useCallback((value: string) => {
        setAppliedBefore(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
            } else {
                setSortOrder("asc");
            }
            return field;
        });
        setPage(1);
    }, []);

    const refresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const clearFilters = useCallback(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter("");
        setEligibilityFilter("");
        setPositionFilter("");
        setAppliedAfter("");
        setAppliedBefore("");
        setPage(1);
    }, []);

    return {
        applications,
        statusSummary,
        jobTitle,
        companyName,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        eligibilityFilter,
        positionFilter,
        appliedAfter,
        appliedBefore,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleEligibilityFilterChange,
        handlePositionFilterChange,
        handleAppliedAfterChange,
        handleAppliedBeforeChange,
        handleSortChange,
        refresh,
        clearFilters,
    };
};
