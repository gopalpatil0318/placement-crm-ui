import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { FeedbackService } from "@/services/student/feedback.service"
import type { BrowseInterviewQuestion } from "@/validators/FeedbackSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useBrowseQuestions(initialLimit = 10, enabled = true, companyId?: string) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roundTypeFilter, setRoundTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // 300ms search debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const queryFilters = useMemo(() => ({
    ...(companyId ? { company_id: companyId } : {}),
    ...(roundTypeFilter ? { round_type: roundTypeFilter } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    sort_by: "created_at" as const,
    sort_order: "desc" as const,
    page,
    limit,
  }), [companyId, roundTypeFilter, debouncedSearch, page, limit])

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.browseQuestions(queryFilters as Record<string, unknown>),
    queryFn: () => FeedbackService.browseInterviewQuestions(queryFilters),
    placeholderData: keepPreviousData,
    enabled,
  })

  const questions: BrowseInterviewQuestion[] = data?.questions ?? []
  const pagination = data?.pagination ?? { page: 1, limit: initialLimit, total: 0, totalPages: 0 }

  // Next-page prefetch
  const queryClient = useQueryClient()
  useEffect(() => {
    if (pagination.page < pagination.totalPages) {
      const nextFilters = { ...queryFilters, page: pagination.page + 1 }
      queryClient.prefetchQuery({
        queryKey: queryKeys.studentPortal.browseQuestions(nextFilters as Record<string, unknown>),
        queryFn: () => FeedbackService.browseInterviewQuestions(nextFilters),
      })
    }
  }, [queryClient, queryFilters, pagination.page, pagination.totalPages])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleRoundTypeFilterChange = useCallback((value: string) => {
    setRoundTypeFilter(value)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  return {
    questions,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    search,
    roundTypeFilter,
    handleSearchChange,
    handleRoundTypeFilterChange,
    page,
    handlePageChange,
  }
}
