import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import { type Feedback, type Pagination } from "@/validators/FeedbackSchema";
import { useYearFilter } from "@/context/YearFilterContext";

// ========================
// HOOK
// ========================

export const useViewFeedback = () => {
    const { selectedYear } = useYearFilter();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [approvalFilter, setApprovalFilter] = useState<string>("pending");
    const [companyFilter, setCompanyFilter] = useState("");
    const [jobFilter, setJobFilter] = useState("");
    const [ratingFilter, setRatingFilter] = useState<string>("");
    const [sortIndex, setSortIndex] = useState(0); // index into SORT_OPTIONS_FEEDBACK

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const SORT_MAP = [
        { sort_by: "created_at", sort_order: "desc" },
        { sort_by: "created_at", sort_order: "asc" },
        { sort_by: "rating", sort_order: "desc" },
        { sort_by: "rating", sort_order: "asc" },
    ] as const;

    const currentSort = SORT_MAP[sortIndex] ?? SORT_MAP[0];

    let isApprovedFilter: boolean | undefined;
    if (approvalFilter === "pending") isApprovedFilter = false;
    else if (approvalFilter === "approved") isApprovedFilter = true;

    const queryFilters = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        is_approved: isApprovedFilter,
        company_id: companyFilter || undefined,
        job_id: jobFilter || undefined,
        rating: ratingFilter ? Number(ratingFilter) : undefined,
        passout_year: selectedYear,
        sort_by: currentSort.sort_by,
        sort_order: currentSort.sort_order,
    }), [page, limit, debouncedSearch, isApprovedFilter, companyFilter, jobFilter, ratingFilter, selectedYear, currentSort]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.feedback.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllFeedback(queryFilters),
        placeholderData: keepPreviousData,
    });

    const feedback: Feedback[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };

    // Next-page prefetch
    const queryClient = useQueryClient();
    useEffect(() => {
        if (pagination.page < pagination.totalPages) {
            const nextFilters = { ...queryFilters, page: pagination.page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.feedback.all(nextFilters),
                queryFn: () => CollegeAdminService.getAllFeedback(nextFilters),
            });
        }
    }, [queryClient, queryFilters, pagination.page, pagination.totalPages]);

    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof ApiError ? queryError.message : "Failed to fetch feedback";
    }
    const errorStatus = queryError instanceof ApiError ? queryError.status : undefined;

    useEffect(() => {
        if (!error) return;
        if (errorStatus === 429) {
            showToast({ type: "error", title: "Rate Limited", description: "Too many requests, please slow down" });
        } else {
            showToast({ type: "error", title: "Fetch Error", description: error });
        }
    }, [error, errorStatus]);

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

    const handleApprovalFilterChange = useCallback((value: string) => {
        setApprovalFilter(value);
        setPage(1);
    }, []);

    const handleCompanyFilterChange = useCallback((value: string) => {
        setCompanyFilter(value);
        setJobFilter(""); // Reset job filter when company changes
        setPage(1);
    }, []);

    const handleJobFilterChange = useCallback((value: string) => {
        setJobFilter(value);
        setPage(1);
    }, []);

    const handleRatingFilterChange = useCallback((value: string) => {
        setRatingFilter(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((index: number) => {
        setSortIndex(index);
        setPage(1);
    }, []);

    return {
        feedback,
        isLoading,
        isFetching,
        error,
        pagination,
        search,
        approvalFilter,
        companyFilter,
        jobFilter,
        ratingFilter,
        sortIndex,
        handleSearchChange,
        handlePageChange,
        handleLimitChange,
        handleApprovalFilterChange,
        handleCompanyFilterChange,
        handleJobFilterChange,
        handleRatingFilterChange,
        handleSortChange,
        refresh: refetch,
    };
};
