import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import { type InterviewQuestion, type Pagination } from "@/validators/FeedbackSchema";

// ========================
// HOOK
// ========================

export const useViewInterviewQuestions = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [approvalFilter, setApprovalFilter] = useState<string>("pending");
    const [companyFilter, setCompanyFilter] = useState("");
    const [topicFilter, setTopicFilter] = useState("");
    const [debouncedTopic, setDebouncedTopic] = useState("");
    const [roundTypeFilter, setRoundTypeFilter] = useState("");
    const [sortIndex, setSortIndex] = useState(0);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const topicTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const SORT_MAP = [
        { sort_by: "created_at", sort_order: "desc" },
        { sort_by: "created_at", sort_order: "asc" },
        { sort_by: "topic", sort_order: "asc" },
        { sort_by: "topic", sort_order: "desc" },
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
        topic: debouncedTopic || undefined,
        round_type: roundTypeFilter || undefined,
        sort_by: currentSort.sort_by,
        sort_order: currentSort.sort_order,
    }), [page, limit, debouncedSearch, isApprovedFilter, companyFilter, debouncedTopic, roundTypeFilter, currentSort]);

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.interviewQuestions.all(queryFilters),
        queryFn: () => CollegeAdminService.getAllInterviewQuestions(queryFilters),
        placeholderData: keepPreviousData,
    });

    const questions: InterviewQuestion[] = Array.isArray(data?.data) ? data.data : [];
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };

    // Next-page prefetch
    const queryClient = useQueryClient();
    useEffect(() => {
        if (pagination.page < pagination.totalPages) {
            const nextFilters = { ...queryFilters, page: pagination.page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.interviewQuestions.all(nextFilters),
                queryFn: () => CollegeAdminService.getAllInterviewQuestions(nextFilters),
            });
        }
    }, [queryClient, queryFilters, pagination.page, pagination.totalPages]);

    let error: string | null = null;
    if (queryError) {
        error = queryError instanceof ApiError ? queryError.message : "Failed to fetch interview questions";
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

    const handleTopicFilterChange = useCallback((value: string) => {
        setTopicFilter(value);
        if (topicTimerRef.current) clearTimeout(topicTimerRef.current);
        topicTimerRef.current = setTimeout(() => {
            setDebouncedTopic(value);
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
        setPage(1);
    }, []);

    const handleRoundTypeFilterChange = useCallback((value: string) => {
        setRoundTypeFilter(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((index: number) => {
        setSortIndex(index);
        setPage(1);
    }, []);

    return {
        questions,
        isLoading,
        isFetching,
        error,
        pagination,
        search,
        approvalFilter,
        companyFilter,
        topicFilter,
        roundTypeFilter,
        sortIndex,
        handleSearchChange,
        handleTopicFilterChange,
        handlePageChange,
        handleLimitChange,
        handleApprovalFilterChange,
        handleCompanyFilterChange,
        handleRoundTypeFilterChange,
        handleSortChange,
        refresh: refetch,
    };
};
