import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { ApiError } from "@/lib/api"
import { SysAdminService } from "@/services/sysadmin/sysadmin.services"
import type { CollegeListParams } from "@/services/sysadmin/sysadmin.services"
import { queryKeys } from "@/lib/queryKeys"

export interface College {
  college_id: string
  college_name: string
  college_subdomain: string
  college_type: string
  college_status: string
  college_city: string
  college_state: string
  default_academic_year: number
  created_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export const useViewColleges = () => {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const navigate = useNavigate()
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clean up debounce timer on unmount
  useEffect(() => () => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
  }, [])

  // Memoize filter object so queryKey reference stays stable
  const queryFilters = useMemo(() => {
    const f: Record<string, unknown> = { page, limit }
    if (debouncedSearch) f.search = debouncedSearch
    if (statusFilter) f.status = statusFilter
    if (typeFilter) f.type = typeFilter
    return f
  }, [page, limit, debouncedSearch, statusFilter, typeFilter])

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.colleges.all(queryFilters),
    queryFn: () => {
      const params: CollegeListParams = { page, limit }
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter
      return SysAdminService.getCollegesData(params)
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  })

  const colleges: College[] = data?.data || []
  const pagination: Pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
  }, [])

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }, [])

  const handleStatusFilterChange = useCallback((status: string) => {
    setStatusFilter(status)
    setPage(1)
  }, [])

  const handleTypeFilterChange = useCallback((type: string) => {
    setTypeFilter(type)
    setPage(1)
  }, [])

  const handleNavigateToAddCollege = useCallback(() => {
    navigate("/sysadmin/colleges/create")
  }, [navigate])

  const handleNavigateToViewCollege = useCallback((id: string) => {
    navigate(`/sysadmin/colleges/${id}`)
  }, [navigate])

  const handleNavigateToEditCollege = useCallback((id: string) => {
    navigate(`/sysadmin/colleges/${id}/edit`)
  }, [navigate])

  return {
    colleges,
    loading: isLoading,
    isFetching,
    error: error instanceof ApiError ? error.message : error ? "Failed to fetch colleges" : null,
    refresh: refetch,
    search,
    page,
    limit,
    pagination,
    statusFilter,
    typeFilter,
    setSearch,
    setPage,
    handleSearchChange,
    handleLimitChange,
    handleStatusFilterChange,
    handleTypeFilterChange,
    handleNavigateToAddCollege,
    handleNavigateToViewCollege,
    handleNavigateToEditCollege,
  }
}
