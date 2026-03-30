import { useState, useCallback, useMemo, useEffect } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { FeedbackService } from "@/services/student/feedback.service"
import {
  SORT_OPTIONS_FEEDBACK,
  type StudentFeedback,
} from "@/validators/FeedbackSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useMyFeedback(initialLimit = 10, enabled = true) {
  const [sortIndex, setSortIndex] = useState(0) // defaults to Newest
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  const sort = SORT_OPTIONS_FEEDBACK[sortIndex]

  const queryFilters = useMemo(() => ({
    sort_by: sort.sort_by,
    sort_order: sort.sort_order,
    page,
    limit,
  }), [sort, page, limit])

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.myFeedback(queryFilters as Record<string, unknown>),
    queryFn: () => FeedbackService.getMyFeedback(queryFilters),
    placeholderData: keepPreviousData,
    enabled,
  })

  const feedback: StudentFeedback[] = data?.feedback ?? []
  const pagination = data?.pagination ?? { page: 1, limit: initialLimit, total: 0, totalPages: 0 }

  // Next-page prefetch
  const queryClient = useQueryClient()
  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      const nextFilters = { ...queryFilters, page: pagination.page + 1 }
      queryClient.prefetchQuery({
        queryKey: queryKeys.studentPortal.myFeedback(nextFilters as Record<string, unknown>),
        queryFn: () => FeedbackService.getMyFeedback(nextFilters),
      })
    }
  }, [queryClient, queryFilters, pagination.page, pagination.totalPages])

  const handleSortChange = useCallback((index: number) => {
    setSortIndex(index)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return {
    feedback,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    sortIndex,
    handleSortChange,
    page,
    handlePageChange,
  }
}
