import { useState, useCallback } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
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
  // ── Filter State ──
  const [activeFilter, setActiveFilter] = useState<RestrictionStatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<RestrictionType | "all">("all")
  const [sortBy, setSortBy] = useState<RestrictionSortField>("created_at")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // ── Build query filters ──
  const queryFilters: RestrictionFilters = {
    ...(activeFilter === "active" ? { is_active: "true" } : {}),
    ...(activeFilter === "resolved" ? { is_active: "false" } : {}),
    ...(typeFilter !== "all" ? { restriction_type: typeFilter } : {}),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
  }

  // ── Query ──
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.myRestrictions(queryFilters as Record<string, unknown>),
    queryFn: () => RestrictionsService.getMyRestrictions(queryFilters),
    placeholderData: keepPreviousData,
    enabled,
  })

  // ── Derived ──
  const restrictions: StudentRestriction[] = data?.restrictions ?? []
  const summary: RestrictionSummary = data?.summary ?? {
    total_restrictions: 0,
    active_count: 0,
    resolved_count: 0,
    appeals_submitted: 0,
    appeals_resolved: 0,
    appeals_pending: 0,
  }
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
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

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
