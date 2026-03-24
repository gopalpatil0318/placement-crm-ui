import { useState, useCallback } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
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
  const queryFilters: StudentNotificationFilters = {
    ...(readFilter === "unread" ? { is_read: false } : readFilter === "read" ? { is_read: true } : {}),
    ...(typeFilter ? { notification_type: typeFilter } : {}),
    sort_order: sortOrder,
    page,
    limit,
  }

  // ── Query ──
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
