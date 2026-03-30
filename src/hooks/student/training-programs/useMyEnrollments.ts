import { useState, useCallback, useMemo, useEffect } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { TrainingProgramsService } from "@/services/student/trainingPrograms.service"
import type {
  StudentEnrollment,
  StudentEnrollmentSummary,
  StudentEnrollmentFilters,
  EnrollmentStatusFilter,
} from "@/validators/TrainingProgramSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useMyEnrollments(initialLimit = 10, enabled = true) {
  const queryClient = useQueryClient()

  // ── Filter State ──
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatusFilter>("all")
  const [sortBy, setSortBy] = useState<StudentEnrollmentFilters["sort_by"]>("enrolled_at")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // ── Build query filters (memoized) ──
  const queryFilters: StudentEnrollmentFilters = useMemo(() => ({
    ...(statusFilter === "all" ? {} : { completion_status: statusFilter }),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
  }), [statusFilter, sortBy, sortOrder, page, limit])

  // ── Query ──
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.myEnrollments(queryFilters as Record<string, unknown>),
    queryFn: () => TrainingProgramsService.getEnrolledTraining(queryFilters),
    placeholderData: keepPreviousData,
    enabled,
  })

  // ── Derived ──
  const enrollments: StudentEnrollment[] = data?.enrollments ?? []
  const summary: StudentEnrollmentSummary = data?.summary ?? {
    total_enrolled: 0,
    enrolled_count: 0,
    in_progress_count: 0,
    completed_count: 0,
    dropped_count: 0,
    failed_count: 0,
    certificates_earned: 0,
  }
  const pagination = data?.pagination ?? { page: 1, limit: initialLimit, total: 0, totalPages: 0 }

  // ── Next-page prefetch ──
  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      const nextFilters = { ...queryFilters, page: pagination.page + 1 }
      queryClient.prefetchQuery({
        queryKey: queryKeys.studentPortal.myEnrollments(nextFilters as Record<string, unknown>),
        queryFn: () => TrainingProgramsService.getEnrolledTraining(nextFilters),
      })
    }
  }, [queryClient, queryFilters, pagination.page, pagination.totalPages])

  // ── Handlers ──
  const handleStatusFilterChange = useCallback((filter: EnrollmentStatusFilter) => {
    setStatusFilter(filter)
    setPage(1)
  }, [])

  const handleSortByChange = useCallback((field: StudentEnrollmentFilters["sort_by"]) => {
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
    enrollments,
    summary,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    statusFilter,
    sortBy,
    sortOrder,
    page,
    handleStatusFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
  }
}
