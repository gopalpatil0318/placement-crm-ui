import { useState, useCallback, useRef, useEffect } from "react"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { TrainingProgramsService } from "@/services/student/trainingPrograms.service"
import type {
  StudentAvailableProgram,
  StudentTrainingFilters,
  ProgramType,
} from "@/validators/TrainingProgramSchema"

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useAvailableTrainings(initialLimit = 10, enabled = true) {
  // ── Filter State ──
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<ProgramType | "all">("all")
  const [sortBy, setSortBy] = useState<StudentTrainingFilters["sort_by"]>("created_at")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)

  // ── 300ms search debounce ──
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  // ── Build query filters ──
  const queryFilters: StudentTrainingFilters = {
    ...(typeFilter !== "all" ? { program_type: typeFilter } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    limit,
  }

  // ── Query ──
  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: queryKeys.studentPortal.availableTrainings(queryFilters as Record<string, unknown>),
    queryFn: () => TrainingProgramsService.getAvailableTraining(queryFilters),
    placeholderData: keepPreviousData,
    enabled,
  })

  // ── Derived ──
  const programs: StudentAvailableProgram[] = data?.programs ?? []
  const pagination = data?.pagination ?? { page: 1, limit: initialLimit, total: 0, totalPages: 0 }

  // ── Handlers ──
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const handleTypeFilterChange = useCallback((filter: ProgramType | "all") => {
    setTypeFilter(filter)
    setPage(1)
  }, [])

  const handleSortByChange = useCallback((field: StudentTrainingFilters["sort_by"]) => {
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
    programs,
    pagination,
    isLoading,
    isFetching,
    isError,
    refetch,
    search,
    typeFilter,
    sortBy,
    sortOrder,
    page,
    handleSearchChange,
    handleTypeFilterChange,
    handleSortByChange,
    handleSortOrderChange,
    handlePageChange,
  }
}
