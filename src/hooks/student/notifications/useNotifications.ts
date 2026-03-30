import { useState, useCallback, useMemo, useEffect } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { NotificationService } from "@/services/student/notification.service"
import type {
  StudentNotification,
  Pagination,
  ReadFilter,
  NotificationType,
  StudentNotificationFilters,
} from "@/validators/NotificationSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useNotifications(initialLimit = 20) {
  // ── Filter State ──
  const [readFilter, setReadFilter] = useState<ReadFilter>("all")
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // ── Build query filters ──
  const queryFilters = useMemo<StudentNotificationFilters>(() => {
    let isReadValue: boolean | undefined;
    if (readFilter === "unread") isReadValue = false;
    else if (readFilter === "read") isReadValue = true;

    return {
      ...(isReadValue === undefined ? {} : { is_read: isReadValue }),
      ...(typeFilter ? { notification_type: typeFilter } : {}),
      sort_order: sortOrder,
      page,
      limit,
    }
  }, [readFilter, typeFilter, sortOrder, page, limit])

  // ── Query ──
  const queryClient = useQueryClient()
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.notifications.studentList(queryFilters as Record<string, unknown>),
    queryFn: () => NotificationService.getMyNotifications(queryFilters),
    placeholderData: keepPreviousData,
  })

  // ── Derived ──
  const notifications: StudentNotification[] = data?.notifications ?? []
  const pagination: Pagination = data?.pagination ?? {
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 0,
  }

  // ── Prefetch next page ──
  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      const nextFilters = { ...queryFilters, page: pagination.page + 1 }
      queryClient.prefetchQuery({
        queryKey: queryKeys.notifications.studentList(nextFilters as Record<string, unknown>),
        queryFn: () => NotificationService.getMyNotifications(nextFilters),
        staleTime: 30_000,
      })
    }
  }, [pagination.page, pagination.totalPages, queryFilters, queryClient])

  // ── Handlers ──
  const handleReadFilterChange = useCallback((filter: ReadFilter) => {
    setReadFilter(filter)
    setPage(1)
  }, [])

  const handleTypeFilterChange = useCallback((type: NotificationType | "") => {
    setTypeFilter(type)
    setPage(1)
  }, [])

  const handleSortOrderChange = useCallback((order: "desc" | "asc") => {
    setSortOrder(order)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  return {
    // Data
    notifications,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,

    // Filters
    readFilter,
    typeFilter,
    sortOrder,
    page,

    // Handlers
    handleReadFilterChange,
    handleTypeFilterChange,
    handleSortOrderChange,
    handlePageChange,
  }
}
