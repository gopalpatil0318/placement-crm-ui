import { useState, useCallback, useMemo } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { SelfReportService } from "@/services/student/selfReport.service"
import type { SelfReport } from "@/services/student/selfReport.service"

type StatusFilter = "all" | "pending" | "approved" | "rejected"
type SortBy = "created_at" | "offer_date"
type SortOrder = "asc" | "desc"

export function useMySelfReports(initialLimit = 10) {
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortBy, setSortBy] = useState<SortBy>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Fetch all reports (backend doesn't support filters, so we filter client-side)
  const queryFilters = useMemo(
    () => ({ page: 1, limit: 100 }),
    [],
  )

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.mySelfReports(
      queryFilters as Record<string, unknown>,
    ),
    queryFn: () => SelfReportService.getMySelfReports(queryFilters),
    placeholderData: keepPreviousData,
  })

  // Client-side filter + sort + paginate
  const allReports: SelfReport[] = data?.reports ?? []

  const filteredSorted = useMemo(() => {
    let filtered = allReports
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.verification_status === statusFilter)
    }
    const sorted = [...filtered].sort((a, b) => {
      const aVal = sortBy === "offer_date" ? (a.form_data.offer_date ?? a.created_at) : a.created_at
      const bVal = sortBy === "offer_date" ? (b.form_data.offer_date ?? b.created_at) : b.created_at
      return sortOrder === "desc"
        ? new Date(bVal).getTime() - new Date(aVal).getTime()
        : new Date(aVal).getTime() - new Date(bVal).getTime()
    })
    return sorted
  }, [allReports, statusFilter, sortBy, sortOrder])

  const total = filteredSorted.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const reports = filteredSorted.slice((page - 1) * limit, page * limit)
  const pagination = { page, limit, total, totalPages }

  const handleStatusFilterChange = useCallback((f: StatusFilter) => {
    setStatusFilter(f)
    setPage(1)
  }, [])

  const handleSortByChange = useCallback((s: SortBy) => {
    setSortBy(s)
    setPage(1)
  }, [])

  const handleSortOrderChange = useCallback((o: SortOrder) => {
    setSortOrder(o)
  }, [])

  const handlePageChange = useCallback((p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return {
    reports,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    sortBy,
    sortOrder,
    handleStatusFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
  }
}
