import { useState, useCallback, useRef, useEffect } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { FeedbackService } from "@/services/student/feedback.service"
import {
  SORT_OPTIONS_QUESTIONS,
  type BrowseInterviewQuestion,
  type BrowseQuestionsFilters,
} from "@/validators/FeedbackSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useBrowseQuestions(initialLimit = 10, enabled = true) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState("")
  const [topicFilter, setTopicFilter] = useState("")
  const [sortIndex, setSortIndex] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // 300ms search debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  const sort = SORT_OPTIONS_QUESTIONS[sortIndex]

  const queryFilters: BrowseQuestionsFilters = {
    ...(companyFilter ? { company_id: companyFilter } : {}),
    ...(topicFilter ? { topic: topicFilter } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    sort_by: sort.sort_by,
    sort_order: sort.sort_order,
    page,
    limit,
  }

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.browseQuestions(queryFilters as Record<string, unknown>),
    queryFn: () => FeedbackService.browseInterviewQuestions(queryFilters),
    placeholderData: keepPreviousData,
    enabled,
  })

  const questions: BrowseInterviewQuestion[] = data?.questions ?? []
  const pagination = data?.pagination ?? { page: 1, limit: initialLimit, total: 0, totalPages: 0 }

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleCompanyFilterChange = useCallback((id: string) => {
    setCompanyFilter(id)
    setPage(1)
  }, [])

  const handleTopicFilterChange = useCallback((value: string) => {
    setTopicFilter((prev) => (prev === value ? "" : value))
    setPage(1)
  }, [])

  const handleSortChange = useCallback((index: number) => {
    setSortIndex(index)
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
    companyFilter,
    topicFilter,
    sortIndex,
    handleSearchChange,
    handleCompanyFilterChange,
    handleTopicFilterChange,
    handleSortChange,
    page,
    handlePageChange,
  }
}
