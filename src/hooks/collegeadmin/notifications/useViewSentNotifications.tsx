import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import {
    type SentNotification,
    type NotificationSummary,
    type Pagination,
} from "@/validators/NotificationSchema";

// ========================
// HOOK
// ========================

export function useViewSentNotifications(overrides?: {
    limit?: number;
    enabled?: boolean;
}) {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(overrides?.limit ?? 20);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [notificationTypeFilter, setNotificationTypeFilter] = useState("");
    const [recipientTypeFilter, setRecipientTypeFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sortIndex, setSortIndex] = useState(0);

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const SORT_MAP = [
        { sort_by: "created_at", sort_order: "desc" },
        { sort_by: "created_at", sort_order: "asc" },
        { sort_by: "title", sort_order: "asc" },
        { sort_by: "notification_type", sort_order: "asc" },
    ] as const;

    const currentSort = SORT_MAP[sortIndex] ?? SORT_MAP[0];

    const queryFilters = useMemo(() => ({
        page,
        limit,
        search: debouncedSearch || undefined,
        notification_type: notificationTypeFilter || undefined,
        recipient_type: recipientTypeFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort_by: currentSort.sort_by,
        sort_order: currentSort.sort_order,
    }), [page, limit, debouncedSearch, notificationTypeFilter, recipientTypeFilter, dateFrom, dateTo, currentSort.sort_by, currentSort.sort_order]);

    const queryClient = useQueryClient();

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.notifications.sent(queryFilters),
        queryFn: () => CollegeAdminService.getSentNotifications({
            notification_type: queryFilters.notification_type,
            recipient_type: queryFilters.recipient_type,
            search: queryFilters.search,
            date_from: queryFilters.date_from,
            date_to: queryFilters.date_to,
            sort_by: queryFilters.sort_by,
            sort_order: queryFilters.sort_order,
            page: queryFilters.page,
            limit: queryFilters.limit,
        }),
        placeholderData: keepPreviousData,
        enabled: overrides?.enabled !== false,
    });

    const notifications: SentNotification[] = Array.isArray(data?.data?.notifications)
        ? data.data.notifications
        : [];
    const summary: NotificationSummary | null = data?.data?.summary ?? null;
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };

    let error: string | null = null;
    let errorStatus: number | undefined;
    if (queryError) {
        if (queryError instanceof ApiError) {
            error = queryError.message;
            errorStatus = queryError.status;
        } else {
            error = "Failed to fetch notifications";
        }
    }

    useEffect(() => {
        if (!error) return;
        showToast({ type: "error", title: getErrorTitle(errorStatus), description: error });
    }, [error, errorStatus]);

    // Prefetch next page
    useEffect(() => {
        if (pagination.totalPages > page) {
            const nextFilters = { ...queryFilters, page: page + 1 };
            queryClient.prefetchQuery({
                queryKey: queryKeys.notifications.sent(nextFilters),
                queryFn: () => CollegeAdminService.getSentNotifications({
                    notification_type: nextFilters.notification_type,
                    recipient_type: nextFilters.recipient_type,
                    search: nextFilters.search,
                    date_from: nextFilters.date_from,
                    date_to: nextFilters.date_to,
                    sort_by: nextFilters.sort_by,
                    sort_order: nextFilters.sort_order,
                    page: nextFilters.page,
                    limit: nextFilters.limit,
                }),
            });
        }
    }, [page, pagination.totalPages, queryFilters, queryClient]);

    // ── Handlers ─────────────────────────────────────────────────────────────

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

    const handleNotificationTypeFilterChange = useCallback((value: string) => {
        setNotificationTypeFilter(value);
        setPage(1);
    }, []);

    const handleRecipientTypeFilterChange = useCallback((value: string) => {
        setRecipientTypeFilter(value);
        setPage(1);
    }, []);

    const handleDateFromChange = useCallback((value: string) => {
        setDateFrom(value);
        setPage(1);
    }, []);

    const handleDateToChange = useCallback((value: string) => {
        setDateTo(value);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((index: number) => {
        setSortIndex(index);
        setPage(1);
    }, []);

    return {
        // Data
        notifications,
        summary,
        pagination,

        // Loading
        isLoading,
        isFetching,
        error,
        refetch,

        // Search
        search,
        handleSearchChange,

        // Filters
        notificationTypeFilter,
        handleNotificationTypeFilterChange,
        recipientTypeFilter,
        handleRecipientTypeFilterChange,
        dateFrom,
        handleDateFromChange,
        dateTo,
        handleDateToChange,

        // Sort
        sortIndex,
        handleSortChange,

        // Pagination
        page,
        handlePageChange,
        limit,
        handleLimitChange,
    };
}
