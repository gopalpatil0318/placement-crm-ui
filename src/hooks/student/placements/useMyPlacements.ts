import { useState, useCallback } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { PlacementService } from "@/services/student/placement.service"
import type {
  StudentPlacement,
  PlacementPagination,
  PlacementStatusSummary,
  PlacementFilters,
  PlacementStatusFilter,
  PlacementStatus,
  PlacementTypeFilter,
  PlacementType,
} from "@/validators/PlacementSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useMyPlacements(initialLimit = 10) {
  // ── Filter State ──
  const [statusFilter, setStatusFilter] = useState<PlacementStatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<PlacementTypeFilter>("all")
  const [sortBy, setSortBy] = useState<PlacementFilters["sort_by"]>("created_at")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // ── Build query filters ──
  const queryFilters: PlacementFilters = {
    ...(statusFilter !== "all" ? { placement_status: statusFilter as PlacementStatus } : {}),
    ...(typeFilter !== "all" ? { placement_type: typeFilter as PlacementType } : {}),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
  }

  // ── Query ──
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.myPlacements(queryFilters as Record<string, unknown>),
    queryFn: () => PlacementService.getMyPlacements(queryFilters),
    placeholderData: keepPreviousData,
  })

  // ── Derived ──
  const placements: StudentPlacement[] = data?.placements ?? []
  const statusSummary: PlacementStatusSummary = data?.statusSummary ?? {
    total: 0,
    offered: 0,
    accepted: 0,
    rejected: 0,
    joined: 0,
    cancelled: 0,
  }
  const pagination: PlacementPagination = data?.pagination ?? {
    page: 1,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  }

  // ── Handlers ──
  const handleStatusFilterChange = useCallback((filter: PlacementStatusFilter) => {
    setStatusFilter(filter)
    setPage(1)
  }, [])

  const handleTypeFilterChange = useCallback((filter: PlacementTypeFilter) => {
    setTypeFilter(filter)
    setPage(1)
  }, [])

  const handleSortByChange = useCallback((field: PlacementFilters["sort_by"]) => {
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

  return {
    placements,
    statusSummary,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    typeFilter,
    sortBy,
    sortOrder,
    page,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
  }
}
