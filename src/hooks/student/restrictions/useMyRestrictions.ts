import { useState, useCallback, useMemo, useEffect } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { RestrictionsService } from "@/services/student/restrictions.service"
import type {
  StudentRestriction,
  RestrictionSummary,
  RestrictionFilters,
  RestrictionType,
  RestrictionStatusFilter,
  RestrictionSortField,
} from "@/validators/RestrictionSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useMyRestrictions(initialLimit = 10, enabled = true) {
  const queryClient = useQueryClient()

  // ── Filter State ──
  const [activeFilter, setActiveFilter] = useState<RestrictionStatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<RestrictionType | "all">("all")
  const [sortBy, setSortBy] = useState<RestrictionSortField>("created_at")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // ── Build query filters (memoized) ──
  const queryFilters: RestrictionFilters = useMemo(() => {
    const filters: RestrictionFilters = {
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      limit,
    }
    if (activeFilter === "active") filters.is_active = "true"
    else if (activeFilter === "resolved") filters.is_active = "false"
    if (typeFilter !== "all") filters.restriction_type = typeFilter
    return filters
  }, [activeFilter, typeFilter, sortBy, sortOrder, page, limit])

  // ── Query ──
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.myRestrictions(queryFilters as Record<string, unknown>),
    queryFn: () => RestrictionsService.getMyRestrictions(queryFilters),
    placeholderData: keepPreviousData,
    enabled,
  })

  // ── Derived ──
  const restrictions: StudentRestriction[] = data?.restrictions ?? []
  const summary: RestrictionSummary = useMemo(() => data?.summary ?? {
    total_restrictions: 0,
    active_count: 0,
    resolved_count: 0,
    appeals_submitted: 0,
    appeals_resolved: 0,
    appeals_pending: 0,
  }, [data?.summary])
  const pagination = data?.pagination ?? { page: 1, limit: initialLimit, total: 0, totalPages: 0 }

  // ── Handlers (all reset page to 1) ──
  const handleActiveFilterChange = useCallback((filter: RestrictionStatusFilter) => {
    setActiveFilter(filter)
    setPage(1)
  }, [])

  const handleTypeFilterChange = useCallback((filter: RestrictionType | "all") => {
    setTypeFilter(filter)
    setPage(1)
  }, [])

  const handleSortByChange = useCallback((field: RestrictionSortField) => {
    setSortBy(field)
    setPage(1)
  }, [])

  const handleSortOrderChange = useCallback((order: "desc" | "asc") => {
    setSortOrder(order)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    globalThis.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  // ── Next-page prefetch ──
  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      const nextFilters = { ...queryFilters, page: pagination.page + 1 }
      queryClient.prefetchQuery({
        queryKey: queryKeys.studentPortal.myRestrictions(nextFilters as Record<string, unknown>),
        queryFn: () => RestrictionsService.getMyRestrictions(nextFilters),
      })
    }
  }, [pagination.page, pagination.totalPages, queryFilters, queryClient])

  // ── Tab Count Helper ──
  const getTabCount = useCallback((tab: RestrictionStatusFilter): number => {
    if (tab === "all") return summary.total_restrictions
    if (tab === "active") return summary.active_count
    return summary.resolved_count
  }, [summary])

  return {
    restrictions,
    summary,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    activeFilter,
    typeFilter,
    sortBy,
    sortOrder,
    page,
    handleActiveFilterChange,
    handleTypeFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
    getTabCount,
  }
}
