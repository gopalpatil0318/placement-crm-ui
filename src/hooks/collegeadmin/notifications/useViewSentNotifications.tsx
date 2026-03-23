import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
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

    const queryFilters: Record<string, unknown> = {
        page,
        limit,
        search: debouncedSearch || undefined,
        notification_type: notificationTypeFilter || undefined,
        recipient_type: recipientTypeFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort_by: currentSort.sort_by,
        sort_order: currentSort.sort_order,
    };

    const { data, isLoading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.notifications.sent(queryFilters),
        queryFn: () => CollegeAdminService.getSentNotifications({
            notification_type: queryFilters.notification_type as string | undefined,
            recipient_type: queryFilters.recipient_type as string | undefined,
            search: queryFilters.search as string | undefined,
            date_from: queryFilters.date_from as string | undefined,
            date_to: queryFilters.date_to as string | undefined,
            sort_by: queryFilters.sort_by as string | undefined,
            sort_order: queryFilters.sort_order as string | undefined,
            page: queryFilters.page as number | undefined,
            limit: queryFilters.limit as number | undefined,
        }),
        placeholderData: keepPreviousData,
        enabled: overrides?.enabled !== false,
    });

    const notifications: SentNotification[] = Array.isArray(data?.data?.notifications)
        ? data.data.notifications
        : [];
    const summary: NotificationSummary | null = data?.data?.summary ?? null;
    const pagination: Pagination = data?.pagination ?? { page, limit, total: 0, totalPages: 0 };

    const error = queryError
        ? (queryError instanceof ApiError ? queryError.message : "Failed to fetch notifications")
        : null;
    const errorStatus = queryError instanceof ApiError ? queryError.status : undefined;

    useEffect(() => {
        if (!error) return;
        if (errorStatus === 429) {
            showToast({ type: "error", title: "Rate Limited", description: error });
        } else {
            showToast({ type: "error", title: "Fetch Error", description: error });
        }
    }, [error, errorStatus]);

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
