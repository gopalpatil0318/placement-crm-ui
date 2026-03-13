import { useState, useEffect, useCallback, useRef } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

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
    const [jobs, setJobs] = useState<JobListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchJobs = useCallback(
        async (
            page: number,
            limit: number,
            searchTerm: string,
            status: string,
            jobType: string,
            sort_by: string,
            sort_order: string
        ) => {
            setLoading(true);
            setError(null);

            try {
                const response = await CollegeAdminService.getAllJobs({
                    page,
                    limit,
                    search: searchTerm || undefined,
                    job_status: status || undefined,
                    job_type: jobType || undefined,
                    sort_by: sort_by || undefined,
                    sort_order: sort_order || undefined,
                });

                setJobs(Array.isArray(response.data) ? response.data : []);

                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to fetch jobs";
                setError(msg);
                showToast({ type: "error", title: "Fetch Error", description: msg });
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchJobs(
            pagination.page,
            pagination.limit,
            search,
            statusFilter,
            jobTypeFilter,
            sortBy,
            sortOrder
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit, statusFilter, jobTypeFilter, sortBy, sortOrder, fetchJobs]);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearch(value);
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
            searchTimerRef.current = setTimeout(() => {
                setPagination((prev) => ({ ...prev, page: 1 }));
                fetchJobs(1, pagination.limit, value, statusFilter, jobTypeFilter, sortBy, sortOrder);
            }, 300);
        },
        [fetchJobs, pagination.limit, statusFilter, jobTypeFilter, sortBy, sortOrder]
    );

    const handlePageChange = useCallback((newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    }, []);

    const handleLimitChange = useCallback((newLimit: number) => {
        setPagination((prev) => ({ ...prev, page: 1, limit: newLimit }));
    }, []);

    const handleStatusFilterChange = useCallback((value: string) => {
        setStatusFilter(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handleJobTypeFilterChange = useCallback((value: string) => {
        setJobTypeFilter(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handleSortChange = useCallback((field: string) => {
        setSortBy(field);
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const refresh = useCallback(() => {
        fetchJobs(pagination.page, pagination.limit, search, statusFilter, jobTypeFilter, sortBy, sortOrder);
    }, [fetchJobs, pagination.page, pagination.limit, search, statusFilter, jobTypeFilter, sortBy, sortOrder]);

    return {
        jobs,
        loading,
        error,
        pagination,
        search,
        statusFilter,
        jobTypeFilter,
        sortBy,
        sortOrder,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleStatusFilterChange,
        handleJobTypeFilterChange,
        handleSortChange,
        refresh,
    };
};
