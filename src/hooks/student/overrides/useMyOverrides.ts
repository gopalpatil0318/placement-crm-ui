import { useState, useCallback, useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { OverridesService } from "@/services/student/overrides.service"
import type { MyOverridesResponse } from "@/services/student/overrides.service"
import type { OverrideStatusFilter } from "@/validators/OverrideSchema"

const LIMIT = 10

export function useMyOverrides() {
  const [statusFilter, setStatusFilter] = useState<OverrideStatusFilter>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)

  const queryFilters = useMemo(() => {
    const f: Record<string, unknown> = { sort_order: sortOrder, page, limit: LIMIT }
    if (statusFilter !== "all") f.status = statusFilter
    return f
  }, [statusFilter, sortOrder, page])

  const query = useQuery<MyOverridesResponse>({
    queryKey: queryKeys.studentPortal.myOverrides(queryFilters),
    queryFn: () =>
      OverridesService.getMyOverrides({
        ...(statusFilter !== "all" && { status: statusFilter }),
        sort_order: sortOrder,
        page,
        limit: LIMIT,
      }),
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  const handleStatusFilterChange = useCallback((value: OverrideStatusFilter) => {
    setStatusFilter(value)
    setPage(1)
  }, [])

  const handleSortOrderChange = useCallback((value: "asc" | "desc") => {
    setSortOrder(value)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((p: number) => {
    setPage(p)
  }, [])

  return {
    overrides: query.data?.overrides ?? [],
    pagination: query.data?.pagination ?? { total: 0, page: 1, limit: LIMIT, totalPages: 0 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
    statusFilter,
    sortOrder,
    handleStatusFilterChange,
    handleSortOrderChange,
    handlePageChange,
  }
}
